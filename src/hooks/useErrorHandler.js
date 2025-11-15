import { useToast } from '@/components/ui/toast';
import { handleApiError } from '@/services/api';

export const useErrorHandler = () => {
  const toast = useToast();

  const handleError = (error) => {
    const errorInfo = handleApiError(error);
    
    // Log l'erreur pour le debugging
    console.error('API Error:', error);
    console.error('Error Info:', errorInfo);

    // Affiche un toast avec le message d'erreur
    toast({
      title: 'Erreur',
      description: errorInfo.message,
      status: 'error',
      duration: 5000,
      isClosable: true,
    });

    return errorInfo;
  };

  return { handleError };
};
