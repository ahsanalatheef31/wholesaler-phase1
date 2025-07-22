from django.db import models

class Supplier(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)

    def __str__(self):
        return self.name

class Product(models.Model):
<<<<<<< HEAD
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='products', null=True, blank=True)
=======
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Received', 'Received'),
        ('Defective', 'Defective'),
        ('Returned', 'Returned'),
    ]
>>>>>>> dcae7d5c4401c771acaa0939f667aebb40e6acfa
    name = models.CharField(max_length=100)
    model_no = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    size = models.CharField(max_length=100)
    pieces = models.IntegerField()
<<<<<<< HEAD

    def __str__(self):
        return self.name
=======
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
>>>>>>> dcae7d5c4401c771acaa0939f667aebb40e6acfa
