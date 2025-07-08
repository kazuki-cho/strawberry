import unittest
import json
from unittest.mock import patch, MagicMock
from app import app

class TestSalaryRecordGenerate(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.patcher = patch('app.get_db_connection')
        self.mock_get_db_connection = self.patcher.start()
        self.addCleanup(self.patcher.stop)
        # DBコネクションとカーソルのモック
        self.mock_conn = MagicMock()
        self.mock_cur = MagicMock()
        self.mock_get_db_connection.return_value = self.mock_conn
        self.mock_conn.cursor.return_value = self.mock_cur

    def test_generate_salary_records_copy_latest(self):
        # 社員1人、該当月レコードなし、直近給与レコードあり
        emp_id = 'emp-uuid-1'
        emp_code = 'E001'
        year_month = '2024-07-01'
        self.mock_cur.fetchall.side_effect = [ [(emp_id, emp_code)] ]
        self.mock_cur.fetchone.side_effect = [ None, (260000, 210000, json.dumps({"type": "salary", "base": 280000, "overtime": 30000})) ]
        #  fetchone/executeの副作用をSQL内容で切り替える関数型に一本化
        def execute_side_effect(sql, params=None):
            print('[TEST] execute called:', sql)
            self.last_sql = sql
            if 'INSERT INTO salary_records' in sql:
                self.insert_called = True
                self.insert_args = params
            return None
        self.mock_cur.execute.side_effect = execute_side_effect
        def fetchone_side_effect(*a, **kw):
            if hasattr(self, 'last_sql'):
                if 'SELECT 1 FROM salary_records' in self.last_sql:
                    return None
                if 'SELECT gross_salary, net_salary, details' in self.last_sql:
                    return (260000, 210000, json.dumps({"type": "salary", "base": 280000, "overtime": 30000}))
                if 'SELECT base_salary, allowances, deductions' in self.last_sql:
                    return (280000, {}, {})
            return None
        self.mock_cur.fetchone.side_effect = fetchone_side_effect
        self.insert_called = False
        self.insert_args = None
        response = self.app.post('/api/salary_records/generate', json={"year_month": year_month, "type": "salary"})
        self.assertEqual(response.status_code, 200)
        self.assertTrue(self.insert_called)
        args = self.insert_args
        self.assertEqual(args[0], emp_id)
        self.assertEqual(args[1], year_month)
        self.assertEqual(args[2], 260000)  # gross_salary
        self.assertEqual(args[3], 210000)  # net_salary
        details = json.loads(args[4])
        self.assertEqual(details["type"], "salary")

    def test_generate_salary_records_no_prev(self):
        # 社員1人、該当月レコードなし、直近給与レコードなし、給与設定あり
        emp_id = 'emp-uuid-2'
        emp_code = 'E002'
        year_month = '2024-07-01'
        self.mock_cur.fetchall.side_effect = [ [(emp_id, emp_code)] ]
        fetchone_values = [ None, None, (280000, {}, {}) ]
        def fetchone_side_effect(*args, **kwargs):
            print('[TEST] fetchone called, remaining:', len(fetchone_values))
            if fetchone_values:
                return fetchone_values.pop(0)
            return None
        self.mock_cur.fetchone.side_effect = fetchone_side_effect
        #  fetchone/executeの副作用をSQL内容で切り替える関数型に一本化
        def execute_side_effect(sql, params=None):
            print('[TEST] execute called:', sql)
            self.last_sql = sql
            if 'INSERT INTO salary_records' in sql:
                self.insert_called = True
                self.insert_args = params
            return None
        self.mock_cur.execute.side_effect = execute_side_effect
        def fetchone_side_effect(*a, **kw):
            if hasattr(self, 'last_sql'):
                if 'SELECT 1 FROM salary_records' in self.last_sql:
                    return None
                if 'SELECT gross_salary, net_salary, details' in self.last_sql:
                    return None
                if 'SELECT base_salary, allowances, deductions' in self.last_sql:
                    return (280000, {}, {})
            return None
        self.mock_cur.fetchone.side_effect = fetchone_side_effect
        self.insert_called = False
        self.insert_args = None
        response = self.app.post('/api/salary_records/generate', json={"year_month": year_month, "type": "salary"})
        self.assertEqual(response.status_code, 200)
        self.assertTrue(self.insert_called)
        args = self.insert_args
        self.assertEqual(args[0], emp_id)
        self.assertEqual(args[1], year_month)
        self.assertEqual(args[2], 280000)
        self.assertEqual(args[3], 280000)
        details = json.loads(args[4])
        self.assertEqual(details["type"], "salary")

if __name__ == '__main__':
    unittest.main()
