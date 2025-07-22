from rest_framework import serializers
from .models import Product,Supplier

class ProductSerializer(serializers.ModelSerializer):
    supplier = serializers.PrimaryKeyRelatedField(queryset=Supplier.objects.all(), required=False, allow_null=True)
    supplier_name = serializers.SerializerMethodField(read_only=True)

    def get_supplier_name(self, obj):
        return obj.supplier.name if obj.supplier else None

    class Meta:
        model = Product
        fields = '__all__'
        # Add supplier_name to the fields output
        extra_fields = ['supplier_name']

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'        