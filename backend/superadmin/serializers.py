from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import Restaurant, Employee

class EmployeeSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=6)
    phone = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model = Employee
        fields = ['name', 'email', 'phone', 'role', 'password']

class RestaurantSerializer(serializers.ModelSerializer):
    owner = EmployeeSerializer(write_only=True)

    class Meta:
        model = Restaurant
        fields = ['name', 'email', 'address', 'phone', 'owner']

    def create(self, validated_data):
        owner_data = validated_data.pop('owner')

        # Create restaurant first
        restaurant = Restaurant.objects.create(**validated_data)

        # Create owner employee, assign role and link to restaurant
        owner = Employee.objects.create(
            name=owner_data['name'],
            email=owner_data['email'],
            phone=owner_data.get('phone', ''),  # Use empty string if phone not provided
            role='owner',
            password=make_password(owner_data['password'])  # Hash the password for security
        )
        owner.restaurants.add(restaurant)
        owner.save()

        return restaurant
