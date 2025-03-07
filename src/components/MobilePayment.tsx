import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Phone, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface MobilePaymentProps {
  amount: number;
  description?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onPaymentComplete?: () => void;
}

const MobilePayment = ({ 
  amount, 
  description, 
  onSuccess, 
  onError,
  onPaymentComplete 
}: MobilePaymentProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [operator, setOperator] = useState('');
  const { toast } = useToast();

  const handlePayment = async () => {
    try {
      setIsProcessing(true);

      // Validation
      if (!phoneNumber || !operator) {
        throw new Error('Veuillez remplir tous les champs');
      }

      if (!/^[0-9]{9}$/.test(phoneNumber)) {
        throw new Error('Numéro de téléphone invalide');
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      // Create payment record
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          amount,
          payment_method_id: operator === 'mtn' ? 'mobile_mtn' : 'mobile_airtel',
          status: 'pending',
          description,
          metadata: {
            phone_number: phoneNumber,
            operator
          }
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update payment status
      const { error: updateError } = await supabase
        .from('payments')
        .update({ status: 'completed' })
        .eq('id', payment.id);

      if (updateError) throw updateError;

      toast({
        title: "Paiement réussi",
        description: "Votre paiement a été traité avec succès",
      });

      onSuccess?.();
      onPaymentComplete?.();

    } catch (error) {
      console.error('Erreur de paiement:', error);
      toast({
        title: "Erreur de paiement",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
      onError?.(error instanceof Error ? error : new Error('Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Paiement Mobile</h3>
        <p className="text-sm text-muted-foreground">
          {description || 'Veuillez choisir votre opérateur et entrer votre numéro de téléphone'}
        </p>
      </div>

      <div className="space-y-4">
        <Select
          value={operator}
          onValueChange={setOperator}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sélectionnez un opérateur" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mtn">
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                MTN Mobile Money
              </div>
            </SelectItem>
            <SelectItem value="airtel">
              <div className="flex items-center">
                <CreditCard className="w-4 h-4 mr-2" />
                Airtel Money
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="tel"
          placeholder="Numéro de téléphone (9 chiffres)"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          maxLength={9}
          className="w-full"
        />

        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex justify-between text-sm">
            <span>Montant à payer:</span>
            <span className="font-semibold">{amount.toLocaleString()} FCFA</span>
          </div>
        </div>

        <Button
          className="w-full"
          onClick={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Traitement en cours...
            </>
          ) : (
            'Payer maintenant'
          )}
        </Button>
      </div>
    </div>
  );
};

export default MobilePayment;
