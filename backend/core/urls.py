from django.urls import path
from .views import EventList, ReservationCreate, validate_qr, staff_login, toggle_event, PromoCodeList, MenuList, PromoCampaignList, PromoTicketCreate, PromoCampaignDetail, health_check, serve_dynamic_qr
from .views import EventDetail

urlpatterns = [
    path("", health_check, name='api-health-check'),
    path('events/', EventList.as_view(), name='event-list'),
    path('events/<int:pk>/', EventDetail.as_view(), name='event-detail'),
    path('reservations/', ReservationCreate.as_view(), name='reservation-create'),
    path('validate-qr/', validate_qr, name='validate-qr'),
    path('staff-login/', staff_login, name='staff-login'),
    path('events/<int:pk>/toggle/', toggle_event, name='toggle-event'),
    path('promos/', PromoCodeList.as_view(), name='promo-list'),
    path('menus/', MenuList.as_view(), name='menu-list'),
    
    # Campaign Routes
    path('campaigns/', PromoCampaignList.as_view(), name='campaign-list'),
    path('campaigns/<int:pk>/', PromoCampaignDetail.as_view(), name='campaign-detail'),
    path('campaigns/ticket/', PromoTicketCreate.as_view(), name='campaign-ticket-create'),

    # Dynamic QR
    path('qr/<str:qr_id>/', serve_dynamic_qr, name='dynamic-qr'),
]
