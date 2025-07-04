# Generated by Django 5.2.3 on 2025-06-30 07:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('superadmin', '0002_user_name_alter_user_phone_restaurant'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='restaurant',
            name='owner',
        ),
        migrations.CreateModel(
            name='Employee',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('phone', models.CharField(max_length=20)),
                ('role', models.CharField(choices=[('owner', 'Owner'), ('manager', 'Manager'), ('kitchen_staff', 'Kitchen Staff'), ('resturant_staff', 'Resturant Staff')], max_length=20)),
                ('restaurants', models.ManyToManyField(related_name='employees', to='superadmin.restaurant')),
            ],
        ),
    ]
