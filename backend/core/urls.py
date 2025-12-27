from django.urls import path
from .views import EventList, ReservationCreate, validate_qr, staff_login, toggle_event, PromoCodeList, MenuList

urlpatterns = [
    path('events/', EventList.as_view(), name='event-list'),
    path('reservations/', ReservationCreate.as_view(), name='reservation-create'),
    path('validate-qr/', validate_qr, name='validate-qr'),
    path('staff-login/', staff_login, name='staff-login'),
    path('events/<int:pk>/toggle/', toggle_event, name='toggle-event'),
    path('promos/', PromoCodeList.as_view(), name='promo-list'),
    path('menus/', MenuList.as_view(), name='menu-list'),
]
