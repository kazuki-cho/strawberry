
import json
import re
import os
import subprocess
from datetime import datetime
from decimal import Decimal
import requests
from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
from urllib.parse import unquote
from werkzeug.exceptions import BadRequest

app = Flask(__name__)
CORS(app)

def get_db_connection():
    return psycopg2.connect(
        host=os.environ.get('POSTGRES_HOST', 'db'),
        database=os.environ.get('POSTGRES_DB', 'strawberry'),
        user=os.environ.get('POSTGRES_USER', 'strawberry'),
        password=os.environ.get('POSTGRES_PASSWORD', 'strawberry'),
        port=os.environ.get('POSTGRES_PORT', 5432),
        client_encoding='UTF8'
    )

# データ取得API (GET /api/insurance-data)
@app.route('/api/insurance-data', methods=['GET'])
def get_insurance_data():
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("SELECT DISTINCT title, effective_date FROM compensation_grades ORDER BY effective_date DESC")
        available_titles = [dict(t) for t in cur.fetchall()]

        selected_title = request.args.get('title')
        if not selected_title and available_titles:
            selected_title = available_titles[0]['title']

        grades = []
        if selected_title:
            cur.execute(
                "SELECT * FROM compensation_grades WHERE title = %s ORDER BY grade",
                (selected_title,)
            )
            grades = [dict(g) for g in cur.fetchall()]

        rates = {}
        if selected_title:
            cur.execute(
                "SELECT * FROM insurance_rates WHERE title = %s",
                (selected_title,)
            )
            db_rates = cur.fetchall()
            for r in db_rates:
                rates[r['insurance_type']] = {
                    'rate': float(r['rate']),
                    'effective_date': r['effective_date'].isoformat()
                }

        cur.close()
        grade_effective_date = None
        if selected_title:
            found_title = next((item for item in available_titles if item['title'] == selected_title), None)
            if found_title:
                grade_effective_date = found_title['effective_date'].isoformat()

        return jsonify({
            'available_titles': available_titles,
            'selected_title': selected_title,
            'grade_effective_date': grade_effective_date,
            'compensation_grades': grades,
            'insurance_rates': rates
        })

    except Exception as e:
        print(f"Error in get_insurance_data: {e}", flush=True)
        return jsonify(error=str(e)), 500
    finally:
        if conn:
            conn.close()

# データ新規作成API (POST /api/insurance-data)
@app.route('/api/insurance-data', methods=['POST'])
def create_insurance_data():
    try:
        data = request.get_json()
        if not data:
            return jsonify(error="リクエストボディが空か、JSON形式が不正です。"), 400
    except BadRequest:
        return jsonify(error="リクエストのJSON形式が不正です。"), 400

    title = data.get('title')
    grade_effective_date = data.get('grade_effective_date')
    rates = data.get('insurance_rates')
    grades = data.get('compensation_grades')

    missing_fields = []
    if not title:
        missing_fields.append("タイトル")
    if not grade_effective_date:
        missing_fields.append("等級表の有効日")
    if rates is None:
        missing_fields.append("保険料率")
    if not grades:
        missing_fields.append("標準報酬月額等級表")

    if missing_fields:
        return jsonify(error=f"必須項目が不足しています: {', '.join(missing_fields)}"), 400

    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("SELECT 1 FROM insurance_rates WHERE title = %s LIMIT 1", (title,))
        if cur.fetchone():
            return jsonify(error=f'タイトル「{title}」は既に使用されています。'), 409

        for ins_type, rate_info in rates.items():
            cur.execute("""
                INSERT INTO insurance_rates (title, insurance_type, rate, effective_date)
                VALUES (%s, %s, %s, %s)
            """, (title, ins_type, rate_info['rate'], rate_info['effective_date']))

        for grade_info in grades:
            cur.execute("""
                INSERT INTO compensation_grades (title, grade, standard_remuneration, remuneration_range_min, remuneration_range_max, effective_date)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                title, grade_info['grade'], grade_info['standard_remuneration'],
                grade_info['remuneration_range_min'], grade_info.get('remuneration_range_max'), grade_effective_date
            ))

        conn.commit()
        cur.close()
        return jsonify(message=f"「{title}」を新規登録しました。"), 201

    except Exception as e:
        if conn: conn.rollback()
        print(f"Error in create_insurance_data: {e}", flush=True)
        return jsonify(error=str(e)), 500
    finally:
        if conn: conn.close()

# データ更新API (PUT /api/insurance-data/<title>)
@app.route('/api/insurance-data/<string:title>', methods=['PUT'])
def update_insurance_data(title):
    decoded_title = unquote(title)

    try:
        data = request.get_json()
        if not data:
            return jsonify(error="リクエストボディが空か、JSON形式が不正です。"), 400
    except BadRequest:
        return jsonify(error="リクエストのJSON形式が不正です。"), 400

    grade_effective_date = data.get('grade_effective_date')
    rates = data.get('insurance_rates')
    grades = data.get('compensation_grades')

    missing_fields = []
    if not grade_effective_date:
        missing_fields.append("等級表の有効日")
    if rates is None:
        missing_fields.append("保険料率")
    if not grades:
        missing_fields.append("標準報酬月額等級表")

    if missing_fields:
        return jsonify(error=f"必須項目が不足しています: {', '.join(missing_fields)}"), 400

    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # --- 保険料率の更新・追加・削除 ---
        cur.execute("SELECT insurance_type FROM insurance_rates WHERE title = %s", (decoded_title,))
        existing_insurance_types = {row[0] for row in cur.fetchall()}

        incoming_insurance_types = set(rates.keys())

        types_to_delete = existing_insurance_types - incoming_insurance_types
        for ins_type in types_to_delete:
            cur.execute("DELETE FROM insurance_rates WHERE title = %s AND insurance_type = %s", (decoded_title, ins_type))

        for ins_type, rate_info in rates.items():
            cur.execute("""
                INSERT INTO insurance_rates (title, insurance_type, rate, effective_date)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (title, insurance_type) DO UPDATE SET
                    rate = EXCLUDED.rate,
                    effective_date = EXCLUDED.effective_date,
                    updated_at = NOW();
            """, (decoded_title, ins_type, rate_info['rate'], rate_info['effective_date']))

        # --- 等級の更新 ---
        for grade_info in grades:
            cur.execute("""
                UPDATE compensation_grades
                SET standard_remuneration = %s, remuneration_range_min = %s, remuneration_range_max = %s, effective_date = %s, updated_at = NOW()
                WHERE title = %s AND grade = %s
            """, (
                grade_info['standard_remuneration'], grade_info['remuneration_range_min'],
                grade_info.get('remuneration_range_max'), grade_effective_date, decoded_title, grade_info['grade']
            ))

        conn.commit()
        cur.close()
        return jsonify(message=f"「{decoded_title}」を更新しました。")

    except Exception as e:
        if conn: conn.rollback()
        print(f"Error in update_insurance_data: {e}", flush=True)
        return jsonify(error=str(e)), 500
    finally:
        if conn: conn.close()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
