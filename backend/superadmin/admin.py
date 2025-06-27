from django.contrib import admin
from django.contrib.auth.admin import UserAdmin


class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'phone', 'role', 'department', 'status', 'is_staff')
    list_filter = ('role', 'department', 'status', 'is_staff')
    search_fields = ('username', 'email', 'phone')
    ordering = ('username',)
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'email', 'phone')}),
        ('Roles/Permissions', {
            'fields': ('role', 'department', 'status', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Important Dates', {'fields': ('last_login', 'date_joined')}),
        ('Activity', {'fields': ('recent_activity',)}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2', 'email', 'phone', 'role', 'department'),
        }),
    )

# @admin.register(SystemAlert)
# class SystemAlertAdmin(admin.ModelAdmin):
#     list_display = ('alert_type', 'truncated_message', 'created_at', 'is_read')
#     list_filter = ('alert_type', 'is_read')
#     search_fields = ('message',)
#     date_hierarchy = 'created_at'
#     actions = ['mark_as_read']
    
#     def truncated_message(self, obj):
#         return obj.message[:50] + '...' if len(obj.message) > 50 else obj.message
#     truncated_message.short_description = 'Message'
    
#     def mark_as_read(self, request, queryset):
#         queryset.update(is_read=True)
#     mark_as_read.short_description = "Mark selected alerts as read"

# @admin.register(ActivityLog)
# class ActivityLogAdmin(admin.ModelAdmin):
#     list_display = ('action', 'actor', 'timestamp', 'truncated_description')
#     list_filter = ('timestamp',)
#     search_fields = ('action', 'description', 'actor__username')
#     date_hierarchy = 'timestamp'
#     readonly_fields = ('actor', 'action', 'timestamp', 'description')
    
#     def truncated_description(self, obj):
#         return obj.description[:75] + '...' if obj.description and len(obj.description) > 75 else obj.description
#     truncated_description.short_description = 'Description'

# admin.site.register(User, CustomUserAdmin)