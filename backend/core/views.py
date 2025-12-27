from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from .models import Event, Reservation, PromoCode, Menu
from .serializers import EventSerializer, ReservationSerializer, PromoCodeSerializer, MenuSerializer

class EventList(generics.ListCreateAPIView):
    queryset = Event.objects.all().order_by('-date')
    serializer_class = EventSerializer

class PromoCodeList(generics.ListCreateAPIView):
    queryset = PromoCode.objects.all()
    serializer_class = PromoCodeSerializer

class MenuList(generics.ListCreateAPIView):
    queryset = Menu.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = MenuSerializer

    def post(self, request, *args, **kwargs):
        # Override to ensure only Image is returned or handle generic creation
        return super().post(request, *args, **kwargs)

class ReservationCreate(generics.CreateAPIView):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer

    def create(self, request, *args, **kwargs):
        event_id = request.data.get('event')
        promo_code = request.data.get('promo_code')
        
        # Validar Evento
        try:
            event = Event.objects.get(id=event_id)
            if not event.is_active:
                 return Response({'status': 'ERROR', 'message': 'Este evento está cerrado.'}, status=status.HTTP_400_BAD_REQUEST)
            if event.reservations.count() >= event.capacity:
                 return Response({'status': 'ERROR', 'message': 'Sold Out.'}, status=status.HTTP_400_BAD_REQUEST)
        except Event.DoesNotExist:
             return Response({'status': 'ERROR', 'message': 'Evento no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check for existing reservation by DNI
        dni = request.data.get('dni')
        existing_reservation = Reservation.objects.filter(event=event, dni=dni).first()
        if existing_reservation:
            serializer = self.get_serializer(existing_reservation)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        # Validar Promo Code
        if promo_code:
            if not PromoCode.objects.filter(code=promo_code, is_active=True).exists():
                 return Response({'status': 'ERROR', 'message': 'Código promocional inválido.'}, status=status.HTTP_400_BAD_REQUEST)

        return super().create(request, *args, **kwargs)

@api_view(['POST'])
def validate_qr(request):
    qr_id = request.data.get('qr_id')
    try:
        reservation = Reservation.objects.get(id=qr_id)
        if reservation.is_validated:
             return Response({'status': 'ALREADY_USED', 'message': 'This ticket has already been used.'}, status=status.HTTP_400_BAD_REQUEST)
        
        reservation.is_validated = True
        reservation.save()
        full_name = f"{reservation.first_name} {reservation.paternal_surname}"
        msg = f'Welcome {full_name}!'
        if reservation.promo_code:
             msg += f" (PROMO: {reservation.promo_code})"
        return Response({'status': 'VALID', 'message': msg, 'event': reservation.event.title})
    except Reservation.DoesNotExist:
        return Response({'status': 'INVALID', 'message': 'Invalid QR Code.'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def staff_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        token, created = Token.objects.get_or_create(user=user)
        return Response({'status': 'OK', 'token': token.key, 'is_staff': user.is_staff})
    return Response({'status': 'ERROR', 'message': 'Credenciales inválidas'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([IsAdminUser]) # Ideally real token auth
def toggle_event(request, pk):
    try:
        event = Event.objects.get(pk=pk)
        event.is_active = not event.is_active
        if 'capacity' in request.data:
            event.capacity = request.data['capacity']
        event.save()
        return Response({'status': 'OK', 'is_active': event.is_active, 'capacity': event.capacity})
    except Event.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
