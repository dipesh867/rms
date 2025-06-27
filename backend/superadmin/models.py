from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'System Administrator'),
        ('owner', 'Restaurant Owner'),
        ('vendor', 'Vendor Partner'),
        ('kitchen', 'Kitchen Staff'),
        ('staff', 'Restaurant Staff'),
        ('manager', 'Restaurant Manager'),
    ]

    DEPARTMENT_CHOICES = [
        ('IT', 'IT'),
        ('Support', 'Support'),
        ('Sales', 'Sales'),
        ('HR', 'Human Resources'),
        ('Finance', 'Finance'),
        ('Operations', 'Operations'),
        ('Management', 'Management'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    ]
    phone=models.CharField(max_length=10)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    department = models.CharField(max_length=50, choices=DEPARTMENT_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    recent_activity = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.role})"


class SystemAlert(models.Model):
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    alert_type = models.CharField(max_length=100, default="General")
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.alert_type}: {self.message[:30]}"


class ActivityLog(models.Model):
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.actor} - {self.action} at {self.timestamp}"

