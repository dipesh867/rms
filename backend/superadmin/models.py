from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('status', 'active')

        if not extra_fields.get('is_superuser'):
            raise ValueError('Superuser must have is_superuser=True.')
        if not extra_fields.get('is_staff'):
            raise ValueError('Superuser must have is_staff=True.')

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'System Administrator'),   # Superuser from createsuperuser
        ('owner', 'Restaurant Owner'),       # Login via owner portal only
        ('vendor', 'Vendor Partner'),
        ('kitchen', 'Kitchen Staff'),
        ('staff', 'Restaurant Staff'),       # Login via staff portal only
        ('manager', 'Restaurant Manager'),   # Login via manager portal only
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

    username = None  # Remove username
    email = models.EmailField(unique=True)

    phone = models.CharField(max_length=10)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    department = models.CharField(max_length=50, choices=DEPARTMENT_CHOICES, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    recent_activity = models.TextField(blank=True, null=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  # Only asks for email + password in createsuperuser

    objects = UserManager()

    def __str__(self):
        return f"{self.email} ({self.role})"
