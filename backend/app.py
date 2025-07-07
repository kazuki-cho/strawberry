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

@app.route('/api/hello')
def hello():
    return jsonify(message="Hello World")

@app.route('/api/dbcheck')
def dbcheck():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT 1')
        result = cur.fetchone()
        cur.close()
        conn.close()
        return jsonify(db_status='ok', result=result[0])
    except Exception as e:
        return jsonify(db_status='ng', error=str(e)), 500

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
