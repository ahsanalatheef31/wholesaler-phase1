from django.db import models

# Create your models here.
from django.db import models

class Product(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Received', 'Received'),
        ('Defective', 'Defective'),
        ('Returned', 'Returned'),
    ]
    name = models.CharField(max_length=100)
    model_no = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    size = models.CharField(max_length=100)
    pieces = models.IntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')