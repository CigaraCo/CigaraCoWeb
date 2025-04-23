
import React from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '@/context/AdminContext';
import AdminLayout from '@/components/Layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, Package, DollarSign } from 'lucide-react';

const AdminDashboard = () => {
  const { products, orders, pendingOrders, getActiveRevenue } = useAdmin();
  
  // Calculate some stats
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalRevenue = getActiveRevenue();
  const newOrdersCount = pendingOrders.length;
  
  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From active orders only
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newOrdersCount}</div>
            <p className="text-xs text-muted-foreground">
              Orders awaiting processing
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Active products in store
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending orders</p>
            ) : (
              <div className="space-y-4">
                {pendingOrders.slice(0, 5).map(order => (
                  <div key={order.id} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{order.customer?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${order.total?.toFixed(2) || '0.00'}</p>
                      <p className="text-sm">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          order.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-6">
              <Link to="/admin/orders" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                View all orders →
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <p className="text-sm text-muted-foreground">No products yet</p>
            ) : (
              <div className="space-y-4">
                {products.slice(0, 5).map(product => (
                  <div key={product.id} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center">
                      <img 
                        src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.svg'} 
                        alt={product.name || 'Product'} 
                        className="w-10 h-10 rounded-md object-cover mr-3"
                      />
                      <p className="font-medium">{product.name || 'Unnamed Product'}</p>
                    </div>
                    <p className="font-medium">${(product.price || 0).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-6">
              <Link to="/admin/products" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                Manage products →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
