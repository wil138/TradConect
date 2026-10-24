"""Registro real contra SQLite en memoria. No modifica SQL Server ni MongoDB."""
import os
import sys
import unittest
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'TradConnect_Api'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
from django.conf import settings
settings.DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': ':memory:'}}
settings.MONGODB_URI = ''
import django
django.setup()
from django.db import connection
from django.contrib.auth.hashers import check_password
from rest_framework.test import APIRequestFactory
from TradConnect.models import Rol, Usuario, Empresa
from TradConnect.views import AuthViewSet
connection.ensure_connection()
connection.connection.create_collation('SQL_Latin1_General_CP1_CI_AS', lambda a, b: (a.casefold() > b.casefold()) - (a.casefold() < b.casefold()))
with connection.schema_editor() as editor:
    for model in [Rol, Usuario, Empresa]: editor.create_model(model)

class RegistrationTests(unittest.TestCase):
    def setUp(self):
        with connection.cursor() as cursor:
            for table in ['Empresa', 'Usuario', 'Rol']: cursor.execute(f'DELETE FROM {table}')
        Rol.objects.create(nombrerol='Restaurante')
        Rol.objects.create(nombrerol='Proveedor')
        self.payload = dict(nombre_usuario='RestaurantePrueba', correo='prueba@example.com', contrasena='UnaClaveDePrueba2026!', razon_social='Negocio Prueba', ruc='RUC-TEST-01', telefono='88887777', rol='restaurant')
    def register(self, payload=None):
        return AuthViewSet.as_view({'post':'register'})(APIRequestFactory().post('/api/auth/register/', self.payload if payload is None else payload, format='json'))
    def test_both_roles_register_and_login(self):
        for index, role in enumerate(['restaurant', 'provider']):
            payload = {**self.payload, 'rol':role, 'correo':f'user{index}@example.com', 'nombre_usuario':f'user{index}', 'ruc':f'RUC-{index}'}
            response = self.register(payload)
            self.assertEqual(response.status_code, 201, response.data)
            self.assertIn('access', response.data)
            self.assertEqual(response.data['usuario']['rol_nombre'], 'Restaurante' if index == 0 else 'Proveedor')
            self.assertTrue(check_password(payload['contrasena'], Usuario.objects.get(correoelectronico=payload['correo']).contrasena))
            login = AuthViewSet.as_view({'post':'login'})(APIRequestFactory().post('/api/auth/login/', {'username':payload['correo'], 'password':payload['contrasena']}, format='json'))
            self.assertEqual(login.status_code, 200)
    def test_invalid_payloads_create_nothing(self):
        for changes in [{'rol':'admin'}, {'telefono':''}, {'ruc':''}, {'contrasena':'123'}, {'razon_social':'x'*151}]:
            response = self.register({**self.payload, **changes})
            self.assertEqual(response.status_code, 400, response.data)
        self.assertEqual(Usuario.objects.count(), 0)
    def test_duplicates_are_validation_errors(self):
        self.assertEqual(self.register().status_code, 201)
        for changes, field in [({'correo':'PRUEBA@example.com'},'correo'), ({'correo':'another@example.com'},'nombre_usuario'), ({'correo':'another@example.com','nombre_usuario':'another'},'ruc')]:
            response = self.register({**self.payload, **changes})
            self.assertEqual(response.status_code, 400)
            self.assertIn(field, response.data)
        self.assertEqual(Usuario.objects.count(), 1)
    def test_company_failure_rolls_back_user(self):
        with patch('TradConnect.views.Empresa.objects.create', side_effect=RuntimeError('simulated write failure')):
            with self.assertRaises(RuntimeError): self.register()
        self.assertEqual(Usuario.objects.count(), 0)
    def test_missing_role_does_not_create_user(self):
        Rol.objects.all().delete()
        self.assertEqual(self.register().status_code, 503)
        self.assertEqual(Usuario.objects.count(), 0)

if __name__ == '__main__': unittest.main()
