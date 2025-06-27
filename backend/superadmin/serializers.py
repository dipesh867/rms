from rest_framework import serializers
from .models import User, SystemAlert, ActivityLog

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'full_name',
            'email',
            'phone',
            'role',
            'department',
            'status',
            'recent_activity',
            'is_active',
            'date_joined'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'is_active': {'read_only': True},
            'date_joined': {'read_only': True},
            'phone': {'required': True}
        }

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()

    def validate_phone(self, value):
        if not value.isdigit() or len(value) != 10:
            raise serializers.ValidationError("Phone number must be 10 digits")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            phone=validated_data['phone'],
            role=validated_data['role'],    
            department=validated_data['department']
        )
        return user

class SystemAlertSerializer(serializers.ModelSerializer):
    formatted_timestamp = serializers.SerializerMethodField()
    
    class Meta:
        model = SystemAlert
        fields = '__all__'
        read_only_fields = ['created_at', 'is_read']
        
    def get_formatted_timestamp(self, obj):
        return obj.created_at.strftime("%Y-%m-%d %H:%M")

class ActivityLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.SerializerMethodField()
    timestamp = serializers.DateTimeField(format="%Y-%m-%d %H:%M", read_only=True)
    
    class Meta:
        model = ActivityLog
        fields = '__all__'
        read_only_fields = ['timestamp']
        
    def get_actor_name(self, obj):
        return obj.actor.username if obj.actor else "System"