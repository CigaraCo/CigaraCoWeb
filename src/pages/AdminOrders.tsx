
import React, { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import AdminLayout from '@/components/Layout/AdminLayout';
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminOrders = () => {
  const { pendingOrders, completedOrders, updateOrderStatus } = useAdmin();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("pending");
  
  const handleStatusChange = (orderId: string, status: string) => {
    updateOrderStatus(orderId, status as any);
  };
  
  const getOrderById = (id: string) => {
    const foundInPending = pendingOrders.find(order => order.id === id);
    if (foundInPending) return foundInPending;
    
    return completedOrders.find(order => order.id === id);
  };
  
  const OrderTable = ({ orders }: { orders: ReturnType<typeof useAdmin>['orders'] }) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6">
                No orders found
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{order.customer?.name || 'N/A'}</p>
                    <p className="text-sm text-muted-foreground">{order.customer?.email || 'N/A'}</p>
                  </div>
                </TableCell>
                <TableCell>
                  {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell className="font-medium">
                  ${(order.total || 0).toFixed(2)}
                </TableCell>
                <TableCell>
                  <Select
                    defaultValue={order.status || 'pending'}
                    onValueChange={(value) => handleStatusChange(order.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <button
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    onClick={() => setSelectedOrder(order.id)}
                  >
                    View Details
                  </button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
  
  // Safely get order with null checking
  const selectedOrderData = selectedOrder ? getOrderById(selectedOrder) : null;
  
  return (
    <AdminLayout title="Orders">
      <Tabs defaultValue="pending" className="w-full mb-6" onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="pending" className="text-center">New Orders</TabsTrigger>
          <TabsTrigger value="completed" className="text-center">Completed/Cancelled</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>New Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTable orders={pendingOrders} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed & Cancelled Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTable orders={completedOrders} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order ID: {selectedOrderData?.id || 'N/A'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrderData && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">
                    Customer Information
                  </h3>
                  <p className="font-medium">
                    {selectedOrderData.customer?.name || 'N/A'}
                  </p>
                  <p>
                    {selectedOrderData.customer?.email || 'N/A'}
                  </p>
                  <p>
                    {selectedOrderData.customer?.phone || 'N/A'}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">
                    Delivery Address
                  </h3>
                  <p>
                    {selectedOrderData.customer?.address || 'N/A'}
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-3">
                  Order Items
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Variant</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrderData.items && selectedOrderData.items.length > 0 ? (
                      selectedOrderData.items.map((item, index) => (
                        <TableRow key={item.id || `item-${index}`}>
                          <TableCell>{item.name || 'Unknown Product'}</TableCell>
                          <TableCell>
                            {item.variant_id ? (item.variantName || item.variant_id) : 'Default'}
                          </TableCell>
                          <TableCell className="text-right">{item.quantity || 0}</TableCell>
                          <TableCell className="text-right">
                            ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">No items found</TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-medium">
                        Total
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${selectedOrderData.total?.toFixed(2) || '0.00'}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminOrders;
