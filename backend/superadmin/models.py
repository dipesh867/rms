from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.conf import settings


# class UserManager(BaseUserManager):
#     def create_user(self, email, password=None, **extra_fields):
#         if not email:
#             raise ValueError("Email is required")
#         email = self.normalize_email(email)
#         user = self.model(email=email, **extra_fields)
#         user.set_password(password)
#         user.save(using=self._db)
#         return user

#     def create_superuser(self, email, password=None, **extra_fields):
#         extra_fields.setdefault('is_superuser', True)
#         extra_fields.setdefault('is_staff', True)
#         extra_fields.setdefault('status', 'active')

#         if not extra_fields.get('is_superuser'):
#             raise ValueError('Superuser must have is_superuser=True.')
#         if not extra_fields.get('is_staff'):
#             raise ValueError('Superuser must have is_staff=True.')

#         return self.create_user(email, password, **extra_fields)


# class User(AbstractUser):
#     ROLE_CHOICES = [
#         ('admin', 'System Administrator'),   # Superuser from createsuperuser
#         ('owner', 'Restaurant Owner'),       # Login via owner portal only
#         ('vendor', 'Vendor Partner'),
#         ('kitchen', 'Kitchen Staff'),
#         ('staff', 'Restaurant Staff'),       # Login via staff portal only
#         ('manager', 'Restaurant Manager'),   # Login via manager portal only
#     ]

#     DEPARTMENT_CHOICES = [
#         ('IT', 'IT'),
#         ('Support', 'Support'),
#         ('Sales', 'Sales'),
#         ('HR', 'Human Resources'),
#         ('Finance', 'Finance'),
#         ('Operations', 'Operations'),
#         ('Management', 'Management'),
#     ]

#     STATUS_CHOICES = [
#         ('active', 'Active'),
#         ('inactive', 'Inactive'),
#     ]

#     username = None  # Remove username
#     email = models.EmailField(unique=True)
#     name = models.CharField(max_length=255, blank=True) 
#     phone = models.CharField(max_length=10,null=True,blank=True)
#     role = models.CharField(max_length=20, choices=ROLE_CHOICES)
#     department = models.CharField(max_length=50, choices=DEPARTMENT_CHOICES, blank=True, null=True)
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
#     recent_activity = models.TextField(blank=True, null=True)

#     USERNAME_FIELD = 'email'
#     REQUIRED_FIELDS = []  # Only asks for email + password in createsuperuser

#     objects = UserManager()

#     def __str__(self):
#         return f"{self.email} ({self.role})"
    


class Restaurant(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    address = models.TextField()
    phone = models.CharField(max_length=20)

    def __str__(self):
        return self.name


class Employee(models.Model):
    ROLE_CHOICES = [
        ('owner','Owner'),
        ('manager', 'Manager'),
        ('kitchen_staff', 'Kitchen Staff'),
        ('resturant_staff', 'Resturant Staff')
    ]

    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, default='')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    restaurants = models.ManyToManyField(Restaurant, related_name='employees')
    password = models.CharField(max_length=128)
    def __str__(self):
        return f"{self.name} - {self.role}"

