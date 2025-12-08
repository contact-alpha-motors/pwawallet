'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth, useUser } from '@/firebase';
import {
  initiateEmailSignIn,
  initiateEmailSignUp,
} from '@/firebase/non-blocking-login';
import { useRouter } from 'next/navigation';
import { FirebaseError } from 'firebase/app';
import { useToast } from '@/hooks/use-toast';
import { Wallet } from 'lucide-react';
import { linkWithCredential, EmailAuthProvider } from 'firebase/auth';


const signUpSchema = z
  .object({
    email: z.string().email('Adresse e-mail invalide'),
    password: z.string().min(6, 'Le mot de passe doit faire au moins 6 caractères'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

const loginSchema = z.object({
  email: z.string().email('Adresse e-mail invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

function getFirebaseAuthError(error: FirebaseError): string {
    switch (error.code) {
        case 'auth/user-not-found':
            return 'Aucun utilisateur trouvé avec cette adresse e-mail.';
        case 'auth/wrong-password':
            return 'Mot de passe incorrect. Veuillez réessayer.';
        case 'auth/email-already-in-use':
            return 'Cette adresse e-mail est déjà utilisée par un autre compte.';
        case 'auth/invalid-email':
            return "L'adresse e-mail n'est pas valide.";
        case 'auth/weak-password':
            return 'Le mot de passe est trop faible. Il doit contenir au moins 6 caractères.';
        case 'auth/credential-already-in-use':
            return 'Ce compte existe déjà. Veuillez vous connecter.';
        default:
            return 'Une erreur est survenue. Veuillez réessayer.';
    }
}

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if user is logged in and not anonymous
    if (!isUserLoading && user && !user.isAnonymous) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const signUpForm = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const handleSignUp = async (values: z.infer<typeof signUpSchema>) => {
    if (!auth.currentUser) {
        throw new Error("Aucun utilisateur n'est connecté pour effectuer la liaison.");
    }
    const credential = EmailAuthProvider.credential(values.email, values.password);
    try {
        await linkWithCredential(auth.currentUser, credential);
        router.push('/');
        toast({
          title: "Compte créé et lié !",
          description: "Votre compte anonyme a été converti en compte permanent."
        });
    } catch(error) {
        if (error instanceof FirebaseError) {
          if (error.code === 'auth/credential-already-in-use') {
             // This case is tricky. It means the email is already registered.
             // The user should sign in instead and we'd need to handle data migration.
             // For now, we'll just show an error.
             setAuthError("Cette adresse e-mail est déjà utilisée. Essayez de vous connecter.");
          } else {
            setAuthError(getFirebaseAuthError(error));
          }
        } else {
           setAuthError('Une erreur inattendue est survenue.');
        }
        throw error; // re-throw to be caught by onFormSubmit
    }
  };

  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    try {
        await initiateEmailSignIn(auth, values.email, values.password);
        router.push('/');
         toast({
          title: "Connexion réussie!",
          description: "Bon retour parmi nous."
        });
    } catch (error) {
        if (error instanceof FirebaseError) {
            setAuthError(getFirebaseAuthError(error));
        } else {
            setAuthError('Une erreur inattendue est survenue.');
        }
        throw error; // re-throw to be caught by onFormSubmit
    }
  };
  
  const onFormSubmit = (
    handler: (values: any) => void,
    form: typeof signUpForm | typeof loginForm
  ) => async (values: any) => {
    setAuthError(null);
    try {
      await handler(values);
    } catch (error) {
      // The error is already set in state by handleSignUp/handleLogin
      // We just need to prevent form submission state from being stuck.
      console.error(error);
    }
  };

  if (isUserLoading || (user && !user.isAnonymous)) {
     return (
       <div className="flex min-h-dvh items-center justify-center bg-background p-4 font-body">
         <p>Chargement...</p>
       </div>
     );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4 font-body">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
            <Wallet className="h-8 w-8 mx-auto text-primary" />
            <h1 className="text-3xl font-bold mt-2">MonPortefeuille</h1>
            <p className="text-muted-foreground">Gérez vos finances personnelles simplement.</p>
        </div>
        <Tabs defaultValue="signup" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Se connecter</TabsTrigger>
            <TabsTrigger value="signup">S'inscrire</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Connexion</CardTitle>
                <CardDescription>
                  Accédez à votre portefeuille en vous connectant.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onFormSubmit(handleLogin, loginForm))} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="votre@email.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mot de passe</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="********"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {authError && <p className="text-sm font-medium text-destructive">{authError}</p>}
                    <Button type="submit" className="w-full" disabled={loginForm.formState.isSubmitting}>
                        {loginForm.formState.isSubmitting ? "Connexion..." : "Se connecter"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Créer un compte</CardTitle>
                <CardDescription>
                  Sauvegardez vos données en créant un compte permanent.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Form {...signUpForm}>
                  <form onSubmit={signUpForm.handleSubmit(onFormSubmit(handleSignUp, signUpForm))} className="space-y-4">
                    <FormField
                      control={signUpForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                             <Input
                              type="email"
                              placeholder="votre@email.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signUpForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mot de passe</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="6 caractères minimum"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={signUpForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmer le mot de passe</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="********"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {authError && <p className="text-sm font-medium text-destructive">{authError}</p>}
                    <Button type="submit" className="w-full" disabled={signUpForm.formState.isSubmitting}>
                        {signUpForm.formState.isSubmitting ? "Création..." : "Créer un compte"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
