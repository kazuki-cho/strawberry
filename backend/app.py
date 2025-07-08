import json
from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
import os

app = Flask(__name__)
CORS(app)

def get_db_connection():
    return psycopg2.connect(
        host=os.environ.get('POSTGRES_HOST', 'db'),
        database=os.environ.get('POSTGRES_DB', 'strawberry'),
        user=os.environ.get('POSTGRES_USER', 'strawberry'),
        password=os.environ.get('POSTGRES_PASSWORD', 'strawberry'),
        port=os.environ.get('POSTGRES_PORT', 5432)
    )



@app.route('/api/employees')
def get_employees():
    try:
        limit = int(request.args.get('limit', 10))
        offset = int(request.args.get('offset', 0))
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT COUNT(*) FROM employees')
        total = cur.fetchone()[0]
        cur.execute('''
            SELECT id, employee_code, first_name, last_name, email, department, position, hire_date
            FROM employees
            ORDER BY employee_code
            LIMIT %s OFFSET %s
        ''', (limit, offset))
        rows = cur.fetchall()
        employees = [
            {
                'id': row[0],
                'employee_code': row[1],
                'first_name': row[2],
                'last_name': row[3],
                'email': row[4],
                'department': row[5],
                'position': row[6],
                'hire_date': row[7].isoformat() if row[7] else None
            }
            for row in rows
        ]
        cur.close()
        conn.close()
        return jsonify({
            'total': total,
            'employees': employees
        })
    except Exception as e:
        return jsonify(error=str(e)), 500

@app.route('/api/employees/<string:employee_id>', methods=['GET'])
def get_employee(employee_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('''
            SELECT id, employee_code, first_name, last_name, email, department, position, hire_date
            FROM employees WHERE id = %s
        ''', (str(employee_id),))
        row = cur.fetchone()
        cur.close()
        conn.close()
        if row:
            employee = {
                'id': row[0],
                'employee_code': row[1],
                'first_name': row[2],
                'last_name': row[3],
                'email': row[4],
                'department': row[5],
                'position': row[6],
                'hire_date': row[7].isoformat() if row[7] else None
            }
            return jsonify(employee)
        else:
            return jsonify(error='Employee not found'), 404
    except Exception as e:
        return jsonify(error=str(e)), 500

@app.route('/api/employees/<string:employee_id>', methods=['PUT'])
def update_employee(employee_id):
    try:
        data = request.get_json()
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('''
            UPDATE employees
            SET first_name = %s, last_name = %s, email = %s, department = %s, position = %s
            WHERE id = %s
        ''', (
            data['first_name'],
            data['last_name'],
            data['email'],
            data['department'],
            data['position'],
            str(employee_id)
        ))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify(message='Employee updated successfully')
    except Exception as e:
        return jsonify(error=str(e)), 500

@app.route('/api/employees/<string:employee_id>/salary', methods=['GET'])
def get_employee_salary_settings(employee_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT base_salary, allowances, deductions FROM employee_salary_settings WHERE employee_id = %s', (employee_id,))
        settings = cur.fetchone()
        cur.close()
        conn.close()
        if settings:
            return jsonify({
                'base_salary': settings[0],
                'allowances': settings[1] or {},
                'deductions': settings[2] or {}
            })
        else:
            return jsonify({ 'base_salary': 0, 'allowances': {}, 'deductions': {} })
    except Exception as e:
        return jsonify(error=str(e)), 500

@app.route('/api/employees/<string:employee_id>/salary', methods=['POST'])
def update_employee_salary_settings(employee_id):
    try:
        data = request.get_json()
        conn = get_db_connection()
        cur = conn.cursor()
        # UPSERT (update or insert) the salary settings
        cur.execute('''
            INSERT INTO employee_salary_settings (employee_id, base_salary, allowances, deductions)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (employee_id) DO UPDATE SET
                base_salary = EXCLUDED.base_salary,
                allowances = EXCLUDED.allowances,
                deductions = EXCLUDED.deductions,
                updated_at = now()
        ''', (
            employee_id,
            data.get('base_salary', 0),
            json.dumps(data.get('allowances', {})),
            json.dumps(data.get('deductions', {}))
        ))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify(message='Salary settings updated successfully')
    except Exception as e:
        return jsonify(error=str(e)), 500

@app.route('/api/salary_records', methods=['GET'])
def get_salary_records():
    try:
        # クエリパラメータの取得
        employee_code = request.args.get('employee_code')
        name = request.args.get('name')
        year = request.args.get('year')
        month = request.args.get('month')
        record_type = request.args.get('type')
        limit = int(request.args.get('limit', 10))
        offset = int(request.args.get('offset', 0))

        conn = get_db_connection()
        cur = conn.cursor()

        # ベースクエリ
        base_query = '''
            FROM salary_records sr
            JOIN employees e ON sr.employee_id = e.id
        '''
        where_clauses = []
        params = []

        # 動的なWHERE句の構築
        if employee_code:
            where_clauses.append("e.employee_code ILIKE %s")
            params.append(f'%{employee_code}%')
        if name:
            where_clauses.append("(e.first_name ILIKE %s OR e.last_name ILIKE %s)")
            params.extend([f'%{name}%', f'%{name}%'])
        if year:
            where_clauses.append("EXTRACT(YEAR FROM sr.year_month) = %s")
            params.append(int(year))
        if month:
            where_clauses.append("EXTRACT(MONTH FROM sr.year_month) = %s")
            params.append(int(month))
        if record_type:
            where_clauses.append("sr.details->>'type' = %s")
            params.append(record_type)

        where_sql = " AND ".join(where_clauses) if where_clauses else "1=1"

        # 合計件数の取得
        count_query = f"SELECT COUNT(*) {base_query} WHERE {where_sql}"
        cur.execute(count_query, tuple(params))
        total = cur.fetchone()[0]

        # データ取得
        query = f'''
            SELECT sr.id, e.employee_code, e.first_name, e.last_name, sr.year_month, sr.details, sr.net_salary
            {base_query}
            WHERE {where_sql}
            ORDER BY sr.year_month DESC, e.employee_code ASC
            LIMIT %s OFFSET %s
        '''
        cur.execute(query, tuple(params + [limit, offset]))
        rows = cur.fetchall()

        records = [
            {
                'id': row[0],
                'employee_code': row[1],
                'first_name': row[2],
                'last_name': row[3],
                'year_month': row[4].isoformat(),
                'details': row[5] or {},
                'net_salary': row[6]
            }
            for row in rows
        ]

        cur.close()
        conn.close()

        return jsonify({
            'total': total,
            'records': records
        })

    except Exception as e:
        return jsonify(error=str(e)), 500

@app.route('/api/salary_records/<string:record_id>', methods=['GET'])
def get_salary_record(record_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('''
            SELECT sr.id, e.employee_code, e.first_name, e.last_name, sr.year_month, sr.gross_salary, sr.net_salary, sr.details
            FROM salary_records sr
            JOIN employees e ON sr.employee_id = e.id
            WHERE sr.id = %s
        ''', (record_id,))
        row = cur.fetchone()
        cur.close()
        conn.close()

        if row:
            record = {
                'id': row[0],
                'employee_code': row[1],
                'first_name': row[2],
                'last_name': row[3],
                'year_month': row[4].isoformat(),
                'gross_salary': row[5],
                'net_salary': row[6],
                'details': row[7] or {}
            }
            return jsonify(record)
        else:
            return jsonify(error='Record not found'), 404
    except Exception as e:
        return jsonify(error=str(e)), 500

@app.route('/api/salary_records', methods=['POST'])
def create_salary_record():
    try:
        data = request.get_json()
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('''
            INSERT INTO salary_records (employee_id, year_month, gross_salary, net_salary, details)
            VALUES ((SELECT id FROM employees WHERE employee_code = %s), %s, %s, %s, %s)
            RETURNING id;
        ''', (
            data['employee_code'],
            data['year_month'],
            data['gross_salary'],
            data['net_salary'],
            json.dumps(data['details'])
        ))
        new_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return jsonify(message='Salary record created successfully', id=new_id), 201
    except Exception as e:
        conn.rollback()
        return jsonify(error=str(e)), 500

@app.route('/api/salary_records/<string:record_id>', methods=['PUT'])
def update_salary_record(record_id):
    try:
        data = request.get_json()
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('''
            UPDATE salary_records
            SET year_month = %s, gross_salary = %s, net_salary = %s, details = %s
            WHERE id = %s
        ''', (
            data['year_month'],
            data['gross_salary'],
            data['net_salary'],
            json.dumps(data['details']),
            record_id
        ))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify(message='Salary record updated successfully')
    except Exception as e:
        conn.rollback()
        return jsonify(error=str(e)), 500

def generate_salary_record_from_previous(prev, record_type):
    gross_salary, net_salary, details = prev
    if isinstance(details, str):
        try:
            details = json.loads(details)
        except Exception:
            details = {}
    if isinstance(details, dict):
        details_copy = details.copy()
        details_copy["type"] = record_type
        if record_type == "bonus":
            details_copy["reason"] = "一括生成ボーナス"
        elif "reason" in details_copy:
            del details_copy["reason"]
    else:
        details_copy = {"type": record_type}
        if record_type == "bonus":
            details_copy["reason"] = "一括生成ボーナス"
    return gross_salary, net_salary, details_copy


def generate_salary_record_from_settings(settings, record_type):
    if settings:
        base_salary = settings[0]
        allowances = settings[1] if settings[1] else {}
        deductions = settings[2] if settings[2] else {}
        if isinstance(allowances, str):
            try:
                allowances = json.loads(allowances)
            except Exception:
                allowances = {}
        if isinstance(deductions, str):
            try:
                deductions = json.loads(deductions)
            except Exception:
                deductions = {}
        gross_salary = base_salary + sum(allowances.values()) if isinstance(allowances, dict) else base_salary
        net_salary = gross_salary - sum(deductions.values()) if isinstance(deductions, dict) else gross_salary
        details = {
            "type": record_type,
            "base_salary": base_salary,
            "allowances": allowances,
            "deductions": deductions,
        }
        if record_type == "bonus":
            details["reason"] = "一括生成ボーナス"
    else:
        base_salary = 0
        allowances = {}
        deductions = {}
        gross_salary = 0
        net_salary = 0
        details = {
            "type": record_type,
            "base_salary": 0,
            "allowances": {},
            "deductions": {},
        }
        if record_type == "bonus":
            details["reason"] = "一括生成ボーナス"
    return gross_salary, net_salary, details

@app.route('/api/salary_records/generate', methods=['POST'])
def generate_salary_records():
    try:
        data = request.get_json()
        year_month_str = data.get('year_month')
        record_type = data.get('type')

        if not year_month_str or not record_type or len(year_month_str) < 8 or '-01' not in year_month_str:
            return jsonify(error='year_month (YYYY-MM-01) and type are required'), 400

        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT id, employee_code FROM employees')
        employees = cur.fetchall()
        generated_count = 0
        deleted_count = 0
        for emp_id, emp_code in employees:
            cur.execute('SELECT id FROM salary_records WHERE employee_id = %s AND year_month = %s', (emp_id, year_month_str))
            existing = cur.fetchone()
            if existing:
                # 既存レコードがある場合、削除してよいか確認
                # 本番運用ではUIやAPIで明示的な確認が必要ですが、ここではAPIリクエストに 'force' フラグがあれば削除実行
                if not data.get('force'):
                    cur.close()
                    conn.close()
                    return jsonify(error=f'既に{year_month_str}の給与レコードが存在します。削除して再作成する場合はforce=trueでリクエストしてください。', employee_code=emp_code), 400
                # 削除実行
                cur.execute('DELETE FROM salary_records WHERE employee_id = %s AND year_month = %s', (emp_id, year_month_str))
                deleted_count += 1
            # 直近給与レコード取得
            cur.execute('''
                SELECT gross_salary, net_salary, details
                FROM salary_records
                WHERE employee_id = %s AND year_month < %s
                ORDER BY year_month DESC
                LIMIT 1
            ''', (emp_id, year_month_str))
            prev = cur.fetchone()
            if prev:
                gross_salary, net_salary, details = generate_salary_record_from_previous(prev, record_type)
            else:
                cur.execute('SELECT base_salary, allowances, deductions FROM employee_salary_settings WHERE employee_id = %s', (emp_id,))
                settings = cur.fetchone()
                gross_salary, net_salary, details = generate_salary_record_from_settings(settings, record_type)
            cur.execute(
                'INSERT INTO salary_records (employee_id, year_month, gross_salary, net_salary, details) VALUES (%s, %s, %s, %s, %s)',
                (emp_id, year_month_str, gross_salary, net_salary, json.dumps(details))
            )
            generated_count += 1
        conn.commit()
        cur.close()
        conn.close()
        return jsonify(message=f'{generated_count} records generated/updated successfully', deleted=deleted_count), 200
    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        return jsonify(error=str(e)), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

