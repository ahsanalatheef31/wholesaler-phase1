from rest_framework import serializers
from .models import Product,Supplier
from .models import Invoice, InvoiceItem
from .models import Category, Size, Color, Material

class ProductSerializer(serializers.ModelSerializer):
    supplier = serializers.PrimaryKeyRelatedField(queryset=Supplier.objects.all(), required=False, allow_null=True)
    supplier_name = serializers.SerializerMethodField(read_only=True)
    bill_number = serializers.SerializerMethodField(read_only=True)
    invoice = serializers.PrimaryKeyRelatedField(queryset=Invoice.objects.all(), required=False, allow_null=True)
    category_name = serializers.SerializerMethodField(read_only=True)
    size_name = serializers.SerializerMethodField(read_only=True)
    color_name = serializers.SerializerMethodField(read_only=True)
    material_name = serializers.SerializerMethodField(read_only=True)

    def get_supplier_name(self, obj):
        return obj.supplier.name if obj.supplier else None

    def get_bill_number(self, obj):
        return obj.invoice.bill_number if hasattr(obj, 'invoice') and obj.invoice else None

    def get_category_name(self, obj):
        return obj.category.name if obj.category else None

    def get_size_name(self, obj):
        return obj.size.name if obj.size else None

    def get_color_name(self, obj):
        return obj.color.name if obj.color else None

    def get_material_name(self, obj):
        return obj.material.name if obj.material else None

    def create(self, validated_data):
        # Handles both single and bulk creation
        if isinstance(validated_data, list):
            products = [Product(**data) for data in validated_data]
            return Product.objects.bulk_create(products)
        return Product.objects.create(**validated_data)

    class Meta:
        model = Product
        fields = ['id', 'name', 'model_no', 'price', 'size', 'size_name', 'pieces', 'supplier', 'supplier_name', 'invoice', 'bill_number', 'status', 'category', 'category_name', 'color', 'color_name', 'material', 'material_name']

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'
    

    
        
        # invoices/serializers.py

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

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class SizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Size
        fields = '__all__'

class ColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Color
        fields = '__all__'

class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = '__all__'
