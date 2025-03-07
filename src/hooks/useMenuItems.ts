
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { MenuItem } from '@/components/menu/types';

export const useMenuItems = (restaurantId: string) => {
  return useQuery<MenuItem[]>({
    queryKey: ['menuItems', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurantId);

      if (error) throw error;

      return (data || []).map(item => {
        // Parse customization options
        let customizationOptions = {};
        try {
          if (item.customization_options) {
            if (typeof item.customization_options === 'string') {
              customizationOptions = JSON.parse(item.customization_options);
            } else {
              customizationOptions = item.customization_options;
            }
          }
        } catch (e) {
          console.error("Error parsing customization options:", e);
        }

        // Create properly typed MenuItem with all required fields
        const menuItem: MenuItem = {
          id: item.id,
          name: item.name,
          description: item.description || "",
          price: item.price,
          image_url: item.image_url || "",
          category: item.category,
          restaurant_id: item.restaurant_id,
          available: item.available !== false,
          created_at: item.created_at,
          updated_at: item.updated_at || new Date().toISOString(),
          ingredients: Array.isArray(item.ingredients) ? item.ingredients : [],
          rating: item.rating || 4.5,
          preparation_time: item.preparation_time || 30,
          dietary_preferences: Array.isArray(item.dietary_preferences) ? item.dietary_preferences : [],
          customization_options: customizationOptions,
          nutritional_info: item.nutritional_info || {
            calories: null,
            protein: null,
            carbs: null,
            fat: null,
            fiber: null
          },
          allergens: Array.isArray(item.allergens) ? item.allergens : [],
          popularity_score: item.popularity_score || 0
        };
        
        return menuItem;
      });
    },
    meta: {
      errorMessage: "Impossible de charger le menu"
    }
  });
};
