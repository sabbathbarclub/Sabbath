import uuid
import qrcode
from io import BytesIO
from django.core.files import File
from django.db import models

class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    date = models.DateTimeField()
    image = models.ImageField(upload_to='events/', blank=True, null=True)
    capacity = models.PositiveIntegerField(default=100)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title

class PromoCode(models.Model):
    code = models.CharField(max_length=50, unique=True)
    is_active = models.BooleanField(default=True)
    discount_text = models.CharField(max_length=100, help_text="Ej: 'Entrada VIP' o '20% OFF'", default="Promo Applied")

    def __str__(self):
        return self.code

class Menu(models.Model):
    image = models.ImageField(upload_to='menus/')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.is_active:
            # Desactivar otros menús para tener solo uno activo
            Menu.objects.filter(is_active=True).exclude(id=self.id).update(is_active=False)
        super().save(*args, **kwargs)

class Reservation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    first_name = models.CharField(max_length=100, default='')
    paternal_surname = models.CharField(max_length=100, default='')
    maternal_surname = models.CharField(max_length=100, default='')
    email = models.EmailField(blank=True, null=True)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='reservations')
    dni = models.CharField(max_length=20, default='00000000')
    birth_date = models.DateField(null=True, blank=True)
    promo_code = models.CharField(max_length=50, blank=True, null=True)
    qr_code = models.ImageField(upload_to='qrcodes/', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_validated = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.qr_code:
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(str(self.id))
            qr.make(fit=True)

            img = qr.make_image(fill_color="black", back_color="white")
            buffer = BytesIO()
            img.save(buffer, format='PNG')
            file_name = f'qr_{self.id}.png'
            self.qr_code.save(file_name, File(buffer), save=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.first_name} {self.paternal_surname} - {self.event.title}"
