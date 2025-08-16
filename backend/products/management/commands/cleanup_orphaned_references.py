from django.core.management.base import BaseCommand
from django.db import connection
from products.models import Product, Size, Color, Material, Category, Supplier, Invoice

class Command(BaseCommand):
    help = 'Clean up orphaned foreign key references in Product model'

    def handle(self, *args, **options):
        self.stdout.write('Starting cleanup of orphaned references...')
        
        with connection.cursor() as cursor:
            # Clean up products with non-existent size references
            cursor.execute("""
                SELECT COUNT(*) FROM products_product p 
                LEFT JOIN products_size s ON p.size_id = s.id 
                WHERE p.size_id IS NOT NULL AND s.id IS NULL
            """)
            orphaned_size_count = cursor.fetchone()[0]
            
            if orphaned_size_count > 0:
                self.stdout.write(f'Found {orphaned_size_count} products with orphaned size references')
                cursor.execute("""
                    UPDATE products_product p 
                    LEFT JOIN products_size s ON p.size_id = s.id 
                    SET p.size_id = NULL 
                    WHERE p.size_id IS NOT NULL AND s.id IS NULL
                """)
                self.stdout.write('Cleaned up orphaned size references')
            
            # Clean up products with non-existent color references
            cursor.execute("""
                SELECT COUNT(*) FROM products_product p 
                LEFT JOIN products_color c ON p.color_id = c.id 
                WHERE p.color_id IS NOT NULL AND c.id IS NULL
            """)
            orphaned_color_count = cursor.fetchone()[0]
            
            if orphaned_color_count > 0:
                self.stdout.write(f'Found {orphaned_color_count} products with orphaned color references')
                cursor.execute("""
                    UPDATE products_product p 
                    LEFT JOIN products_color c ON p.color_id = c.id 
                    SET p.color_id = NULL 
                    WHERE p.color_id IS NOT NULL AND c.id IS NULL
                """)
                self.stdout.write('Cleaned up orphaned color references')
            
            # Clean up products with non-existent material references
            cursor.execute("""
                SELECT COUNT(*) FROM products_product p 
                LEFT JOIN products_material m ON p.material_id = m.id 
                WHERE p.material_id IS NOT NULL AND m.id IS NULL
            """)
            orphaned_material_count = cursor.fetchone()[0]
            
            if orphaned_material_count > 0:
                self.stdout.write(f'Found {orphaned_material_count} products with orphaned material references')
                cursor.execute("""
                    UPDATE products_product p 
                    LEFT JOIN products_material m ON p.material_id = m.id 
                    SET p.material_id = NULL 
                    WHERE p.material_id IS NOT NULL AND m.id IS NULL
                """)
                self.stdout.write('Cleaned up orphaned material references')
            
            # Clean up products with non-existent category references
            cursor.execute("""
                SELECT COUNT(*) FROM products_product p 
                LEFT JOIN products_category cat ON p.category_id = cat.id 
                WHERE p.category_id IS NOT NULL AND cat.id IS NULL
            """)
            orphaned_category_count = cursor.fetchone()[0]
            
            if orphaned_category_count > 0:
                self.stdout.write(f'Found {orphaned_category_count} products with orphaned category references')
                cursor.execute("""
                    UPDATE products_product p 
                    LEFT JOIN products_category cat ON p.category_id = cat.id 
                    SET p.category_id = NULL 
                    WHERE p.category_id IS NOT NULL AND cat.id IS NULL
                """)
                self.stdout.write('Cleaned up orphaned category references')
            
            # Clean up products with non-existent supplier references
            cursor.execute("""
                SELECT COUNT(*) FROM products_product p 
                LEFT JOIN products_supplier sup ON p.supplier_id = sup.id 
                WHERE p.supplier_id IS NOT NULL AND sup.id IS NULL
            """)
            orphaned_supplier_count = cursor.fetchone()[0]
            
            if orphaned_supplier_count > 0:
                self.stdout.write(f'Found {orphaned_supplier_count} products with orphaned supplier references')
                cursor.execute("""
                    UPDATE products_product p 
                    LEFT JOIN products_supplier sup ON p.supplier_id = sup.id 
                    SET p.supplier_id = NULL 
                    WHERE p.supplier_id IS NOT NULL AND sup.id IS NULL
                """)
                self.stdout.write('Cleaned up orphaned supplier references')
            
            # Clean up products with non-existent invoice references
            cursor.execute("""
                SELECT COUNT(*) FROM products_product p 
                LEFT JOIN products_invoice inv ON p.invoice_id = inv.id 
                WHERE p.invoice_id IS NOT NULL AND inv.id IS NULL
            """)
            orphaned_invoice_count = cursor.fetchone()[0]
            
            if orphaned_invoice_count > 0:
                self.stdout.write(f'Found {orphaned_invoice_count} products with orphaned invoice references')
                cursor.execute("""
                    UPDATE products_product p 
                    LEFT JOIN products_invoice inv ON p.invoice_id = inv.id 
                    SET p.invoice_id = NULL 
                    WHERE p.invoice_id IS NOT NULL AND inv.id IS NULL
                """)
                self.stdout.write('Cleaned up orphaned invoice references')
        
        self.stdout.write(self.style.SUCCESS('Cleanup completed successfully!'))
