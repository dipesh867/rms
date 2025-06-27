# serializers.py
from rest_framework import serializers
from django.contrib.auth import authenticate
from typing import cast
from .models import User

class RoleBasedLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    expected_role = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        expected_role = data.get('expected_role')

        user = authenticate(username=email, password=password)
        if user is None:
            raise serializers.ValidationError("Invalid email or password")

        # Tell type checker this is your custom User with role attribute
        user = cast(User, user)

        if user.role != expected_role:
            raise serializers.ValidationError(
                f"Access denied: You are '{user.role}', not allowed in the '{expected_role}' portal"
            )

        if user.status != 'active':
            raise serializers.ValidationError("User is inactive")

        data['user'] = user
        return data
