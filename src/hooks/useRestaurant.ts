
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Restaurant, BusinessHours } from '@/types/restaurant';

export const useRestaurant = (restaurantId: string) => {
  return useQuery<Restaurant>({
    queryKey: ['restaurant', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single();

      if (error) {
        console.error("Error fetching restaurant:", error);
        throw error;
      }

      if (!data) {
        throw new Error("Restaurant not found");
      }

      // Parse business hours or use default
      let businessHours: BusinessHours;
      try {
        if (data.business_hours) {
          businessHours = typeof data.business_hours === 'string' 
            ? JSON.parse(data.business_hours)
            : data.business_hours as unknown as BusinessHours;
        } else {
          businessHours = {
            regular: {
              monday: { open: '08:00', close: '22:00' },
              tuesday: { open: '08:00', close: '22:00' },
              wednesday: { open: '08:00', close: '22:00' },
              thursday: { open: '08:00', close: '22:00' },
              friday: { open: '08:00', close: '22:00' },
              saturday: { open: '08:00', close: '22:00' },
              sunday: { open: '08:00', close: '22:00' }
            }
          };
        }
      } catch (e) {
        console.error("Error parsing business hours:", e);
        businessHours = {
          regular: {
            monday: { open: '08:00', close: '22:00' },
            tuesday: { open: '08:00', close: '22:00' },
            wednesday: { open: '08:00', close: '22:00' },
            thursday: { open: '08:00', close: '22:00' },
            friday: { open: '08:00', close: '22:00' },
            saturday: { open: '08:00', close: '22:00' },
            sunday: { open: '08:00', close: '22:00' }
          }
        };
      }

      // Transform the database response into our Restaurant type
      const restaurant: Restaurant = {
        id: data.id,
        name: data.name || 'Unknown Restaurant',
        description: data.description || '',
        address: data.address || '',
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        status: (data.status as "open" | "closed" | "busy") || 'closed',
        phone: data.phone || '',
        email: data.email || '',
        average_prep_time: data.average_prep_time || 30,
        total_ratings: data.total_ratings || 0,
        minimum_order: data.minimum_order || 0,
        delivery_fee: data.delivery_fee || 0,
        business_hours: businessHours,
        special_days: data.special_days as string[] || [],
        cuisine_type: data.cuisine_type || '',
        banner_image_url: data.banner_image_url || '',
        logo_url: data.logo_url || '',
        rating: data.rating || 0,
        trending: data.trending || false
      };

      return restaurant;
    },
    meta: {
      errorMessage: "Impossible de charger les détails du restaurant"
    }
  });
};
