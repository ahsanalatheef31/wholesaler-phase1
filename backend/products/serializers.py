from rest_framework import serializers
from .models import Product,Supplier
from .models import Invoice, InvoiceItem

class ProductSerializer(serializers.ModelSerializer):
    supplier = serializers.PrimaryKeyRelatedField(queryset=Supplier.objects.all(), required=False, allow_null=True)
    supplier_name = serializers.SerializerMethodField(read_only=True)
    bill_number = serializers.SerializerMethodField(read_only=True)
    invoice = serializers.PrimaryKeyRelatedField(queryset=Invoice.objects.all(), required=False, allow_null=True)

    def get_supplier_name(self, obj):
        return obj.supplier.name if obj.supplier else None

    def get_bill_number(self, obj):
        return obj.invoice.bill_number if hasattr(obj, 'invoice') and obj.invoice else None

    def create(self, validated_data):
        # Handles both single and bulk creation
        if isinstance(validated_data, list):
            products = [Product(**data) for data in validated_data]
            return Product.objects.bulk_create(products)
        return Product.objects.create(**validated_data)

    class Meta:
        model = Product
        fields = '__all__'
        # Add supplier_name to the fields output
        extra_fields = ['supplier_name', 'bill_number']

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'
    

    
        
        # invoices/serializers.py

from rest_framework import serializers
from .models import Invoice, InvoiceItem

class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = '__all__'

class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True)

    class Meta:
        model = Invoice
        fields = ['id', 'bill_number', 'created_at', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        invoice = Invoice.objects.create(**validated_data)
        for item in items_data:
            InvoiceItem.objects.create(invoice=invoice, **item)
        return invoice
