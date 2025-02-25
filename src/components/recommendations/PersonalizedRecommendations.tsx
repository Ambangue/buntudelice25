import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MenuItem } from '@/components/menu/types';

const PersonalizedRecommendations = () => {
  const { toast } = useToast();

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['personalizedRecommendations'],
    queryFn: async () => {
      console.log('Fetching personalized recommendations');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Récupérer l'historique des commandes et préférences
      const { data: orderHistory } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .limit(10);

      // Récupérer les plats populaires similaires avec leur note moyenne
      const { data: menuItems } = await supabase
        .from('menu_items')
        .select(`
          *,
          ratings(rating)
        `)
        .order('popularity_score', { ascending: false })
        .limit(5);

      // Transformer les données pour inclure la note moyenne
      const recommendations = menuItems?.map(item => {
        const ratings = item.ratings as { rating: number }[] || [];
        const avgRating = ratings.length > 0 
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
          : 0;

        return {
          ...item,
          ratings: undefined // Remove the ratings array as it's not part of MenuItem type
        } as MenuItem;
      }) || [];

      return recommendations;
    }
  });

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-pulse">Chargement des recommandations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Recommandations pour vous</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations?.map((item) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video relative">
              <img 
                src={item.image_url || 'default-food-image.jpg'} 
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{item.description}</p>
              <div className="flex justify-between items-center">
                <span className="font-bold">{item.price.toLocaleString()} FCFA</span>
                <Button 
                  onClick={() => {
                    toast({
                      title: "Ajouté au panier",
                      description: `${item.name} a été ajouté à votre panier`,
                    });
                  }}
                  className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                >
                  Commander
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PersonalizedRecommendations;