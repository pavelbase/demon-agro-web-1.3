// Synchronizace produktů mezi localStorage a Supabase
// ============================================================================
// Tento modul zajišťuje, že:
// 1. Produkty z localStorage se ukládají do Supabase (perzistence)
// 2. Produkty ze Supabase se načítají do localStorage (sdílení mezi režimy)
// 3. localStorage slouží jako cache pro rychlý přístup
// Stejný pattern jako images-sync.ts
// ============================================================================

import { getProducts, saveProducts, Product } from './products';

// Flag pro zabránění vícenásobnému volání
let isSyncing = false;
let hasInitialSync = false;

/**
 * Načte produkty ze Supabase a uloží do localStorage
 * Volá se automaticky při načtení stránky
 */
export async function syncProductsFromSupabase(): Promise<void> {
  if (isSyncing || hasInitialSync) return;
  if (typeof window === 'undefined') return;
  
  isSyncing = true;
  
  try {
    const response = await fetch('/api/public-products');
    
    if (!response.ok) {
      throw new Error('Failed to fetch products from Supabase');
    }
    
    const { products } = await response.json();
    
    if (products && Object.keys(products).length > 0) {
      // Převést objekt na pole
      const productsArray: Product[] = Object.values(products);
      
      // Uložit do localStorage
      saveProducts(productsArray);
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Products synced from Supabase:', productsArray.length);
      }
    } else {
      // Pokud je Supabase prázdná, migruj z localStorage do Supabase
      const localProducts = getProducts();
      if (localProducts.length > 0) {
        if (process.env.NODE_ENV === 'development') {
          console.log('📤 Migrating products from localStorage to Supabase...');
        }
        await migrateLocalStorageToSupabase(localProducts);
      }
    }
    
    hasInitialSync = true;
  } catch (error) {
    console.error('Error syncing products:', error);
    // Pokud se nepodaří načíst ze Supabase, pokračuj s localStorage
  } finally {
    isSyncing = false;
  }
}

/**
 * Uloží produkt do localStorage a Supabase
 */
export async function saveProductWithSync(product: Product): Promise<void> {
  // Nejdřív ulož do localStorage (okamžitá změna)
  const products = getProducts();
  const existingIndex = products.findIndex(p => p.id === product.id);
  
  if (existingIndex >= 0) {
    products[existingIndex] = product;
  } else {
    products.push(product);
  }
  
  saveProducts(products);
  
  // Pak ulož do Supabase (perzistence)
  try {
    const response = await fetch('/api/public-products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        productId: product.id, 
        productData: product 
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save product to Supabase');
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Product '${product.id}' saved to Supabase`);
    }
  } catch (error) {
    console.error(`Error saving product '${product.id}' to Supabase:`, error);
    // I když se nepodaří uložit do Supabase, produkt je v localStorage
  }
}

/**
 * Smaže produkt z localStorage a Supabase
 */
export async function deleteProductWithSync(productId: string): Promise<void> {
  // Nejdřív smaž z localStorage (okamžitá změna)
  const products = getProducts();
  const filteredProducts = products.filter(p => p.id !== productId);
  saveProducts(filteredProducts);
  
  // Pak smaž ze Supabase
  try {
    const response = await fetch(`/api/public-products?product_id=${encodeURIComponent(productId)}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete product from Supabase');
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Product '${productId}' deleted from Supabase`);
    }
  } catch (error) {
    console.error(`Error deleting product '${productId}' from Supabase:`, error);
  }
}

/**
 * Uloží všechny produkty do localStorage a Supabase
 */
export async function saveAllProductsWithSync(products: Product[]): Promise<void> {
  // Nejdřív ulož do localStorage (okamžitá změna)
  saveProducts(products);
  
  // Pak ulož do Supabase (perzistence)
  const promises = products.map(product => 
    fetch('/api/public-products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        productId: product.id, 
        productData: product 
      }),
    })
  );
  
  try {
    await Promise.all(promises);
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ All ${products.length} products saved to Supabase`);
    }
  } catch (error) {
    console.error('Error saving all products to Supabase:', error);
  }
}

/**
 * Migruje všechny produkty z localStorage do Supabase
 * (jednorázová migrace)
 */
async function migrateLocalStorageToSupabase(products: Product[]): Promise<void> {
  let successCount = 0;
  
  for (const product of products) {
    try {
      const response = await fetch('/api/public-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          productId: product.id, 
          productData: product 
        }),
      });
      
      if (response.ok) {
        successCount++;
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Failed to migrate product '${product.id}':`, error);
      }
    }
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`✅ Migrated ${successCount}/${products.length} products to Supabase`);
  }
}

/**
 * Hook pro automatickou synchronizaci při načtení stránky
 * Použití: Zavolat na začátku aplikace (např. v layout.tsx)
 */
export function useProductsSync() {
  if (typeof window !== 'undefined' && !hasInitialSync) {
    syncProductsFromSupabase();
  }
}

