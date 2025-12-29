from rest_framework import serializers # Force Reload
from .models import Event, Reservation, PromoCode, Menu, PromoCampaign, PromoTicket
from datetime import date

class PromoCampaignSerializer(serializers.ModelSerializer):
    tickets_claimed = serializers.SerializerMethodField()

    class Meta:
        model = PromoCampaign
        fields = '__all__'

    def get_tickets_claimed(self, obj):
        # Now manual_claims is the Single Source of Truth for the total count
        return obj.manual_claims

class PromoTicketSerializer(serializers.ModelSerializer):
    campaign_title = serializers.ReadOnlyField(source='campaign.title')
    benefit = serializers.ReadOnlyField(source='campaign.current_benefit')
    qr_base64 = serializers.SerializerMethodField()

    class Meta:
        model = PromoTicket
        fields = ['id', 'campaign', 'campaign_title', 'benefit', 'name', 'dni', 'qr_code', 'qr_base64', 'is_used', 'created_at']
        read_only_fields = ['qr_code', 'is_used']

    def get_qr_base64(self, obj):
        if not obj.qr_code:
            return None
        try:
            import base64
            obj.qr_code.open('rb')
            data = base64.b64encode(obj.qr_code.read()).decode('utf-8')
            obj.qr_code.close()
            return f"data:image/png;base64,{data}"
        except Exception:
            return None

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
