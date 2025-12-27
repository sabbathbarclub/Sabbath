from rest_framework import serializers
from .models import Event, Reservation, PromoCode, Menu
from datetime import date

class PromoCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromoCode
        fields = '__all__'

class MenuSerializer(serializers.ModelSerializer):
    class Meta:
        model = Menu
        fields = '__all__'

class EventSerializer(serializers.ModelSerializer):
    reservations_count = serializers.IntegerField(source='reservations.count', read_only=True)
    class Meta:
        model = Event
        fields = '__all__'

class ReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = '__all__'
        read_only_fields = ('id', 'qr_code', 'created_at', 'is_validated')

    def validate_birth_date(self, value):
        if not value:
            raise serializers.ValidationError("La fecha de nacimiento es obligatoria.")
        today = date.today()
        age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
        if age < 18:
            raise serializers.ValidationError("Debes ser mayor de 18 años para reservar.")
        return value
