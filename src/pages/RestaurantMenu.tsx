
import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRestaurant } from '@/hooks/useRestaurant';
import { useMenuItems } from '@/hooks/useMenuItems';
import MenuItemCard from '@/components/restaurant/MenuItemCard';
import CartSummary from '@/components/restaurant/CartSummary';
import RestaurantHeader from '@/components/restaurant/RestaurantHeader';
import type { CartItem } from '@/types/cart';
import { useCart } from '@/hooks/useCart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RestaurantMenu() {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  
  if (!restaurantId) throw new Error('Restaurant ID is required');

  const { data: restaurant, isLoading: isLoadingRestaurant } = useRestaurant(restaurantId);
  const { data: menuItems, isLoading: isLoadingMenu } = useMenuItems(restaurantId);
  const { addToCart, removeFromCart, cart } = useCart();

  const handleAddToCart = useCallback((item: CartItem) => {
    addToCart(item);
    toast({
      title: "Ajouté au panier",
      description: `${item.name} a été ajouté à votre commande`,
    });
  }, [addToCart, toast]);

  const handleRemoveFromCart = useCallback((itemId: string) => {
    removeFromCart(itemId);
  }, [removeFromCart]);

  const getCategories = useCallback(() => {
    if (!menuItems) return [];
    
    const categories = Array.from(new Set(menuItems.map(item => item.category)));
    return ["all", ...categories];
  }, [menuItems]);

  const getFilteredItems = useCallback(() => {
    if (!menuItems) return [];
    
    if (activeCategory === "all") return menuItems;
    return menuItems.filter(item => item.category === activeCategory);
  }, [menuItems, activeCategory]);

  if (isLoadingRestaurant || isLoadingMenu) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-t-2 border-orange-500 border-r-2 rounded-full mx-auto mb-4"></div>
          <p className="text-white">Chargement du restaurant...</p>
        </div>
      </div>
    );
  }

  if (!restaurant || !menuItems) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-xl">Restaurant non trouvé</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate('/restaurants')}
          >
            Retour aux restaurants
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          className="mb-4 text-white"
          onClick={() => navigate('/restaurants')}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Retour aux restaurants
        </Button>

        <RestaurantHeader restaurant={restaurant} />
        
        <div className="mt-8">
          <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="mb-6 bg-black/20 p-1">
              {getCategories().map(category => (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className="capitalize data-[state=active]:bg-orange-500"
                >
                  {category === "all" ? "Tout" : category}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeCategory} className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {getFilteredItems().map((item) => (
                      <MenuItemCard 
                        key={item.id}
                        item={item}
                        onAddToCart={() => handleAddToCart({
                          id: item.id,
                          name: item.name,
                          price: item.price,
                          restaurant_id: restaurantId,
                          image_url: item.image_url,
                          category: item.category,
                          description: item.description,
                          available: item.available,
                          customization_options: item.customization_options || {},
                          quantity: 1
                        })}
                        onRemoveFromCart={handleRemoveFromCart}
                        quantity={cart.items.find(cartItem => cartItem.id === item.id)?.quantity || 0}
                        showNutritionalInfo={true}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="md:col-span-1 md:sticky md:top-4 self-start">
                  <CartSummary 
                    items={cart.items} 
                    onCheckout={() => {
                      toast({
                        title: "Paiement",
                        description: "Fonctionnalité de paiement en cours de développement",
                      });
                    }} 
                    onRemoveItem={handleRemoveFromCart}
                    onUpdateQuantity={(itemId, quantity) => {
                      const item = cart.items.find(item => item.id === itemId);
                      if (item) {
                        if (quantity <= 0) {
                          removeFromCart(itemId);
                        } else {
                          addToCart({
                            ...item,
                            quantity
                          });
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
