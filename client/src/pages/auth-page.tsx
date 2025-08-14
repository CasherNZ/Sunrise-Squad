import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Loader2, Sun, Sparkles } from "lucide-react";
import { Redirect } from "wouter";

export default function AuthPage() {
  const { user, isLoading, loginMutation, registerMutation, forgotPasswordMutation, resetPasswordMutation } = useAuth();
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ 
    email: "", 
    password: "", 
    firstName: "", 
    lastName: "" 
  });
  const [resetForm, setResetForm] = useState({ email: "", newPassword: "" });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Redirect if already logged in
  if (!isLoading && user) {
    return <Redirect to="/" />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginForm);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(registerForm);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    forgotPasswordMutation.mutate({ email: resetForm.email });
    setShowResetPassword(true);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    // Extract token from URL params if it exists
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      resetPasswordMutation.mutate({ token, newPassword: resetForm.newPassword });
    } else {
      resetPasswordMutation.mutate({ email: resetForm.email, newPassword: resetForm.newPassword });
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Auth Form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            {/* Sunshine Squad Banner */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <Sun className="h-12 w-12 text-yellow-500" />
                <Sparkles className="h-6 w-6 text-orange-400 absolute -top-1 -right-1" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                  Sunshine Squad
                </h1>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <div className="h-1 w-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"></div>
                  <Sun className="h-3 w-3 text-yellow-500" />
                  <div className="h-1 w-8 bg-gradient-to-r from-orange-400 to-red-400 rounded-full"></div>
                </div>
              </div>
            </div>
            <p className="text-muted-foreground mt-2">
              Where morning routines become family adventures
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome back</CardTitle>
                  <CardDescription>
                    Sign in to your account to continue
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        required
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex-col space-y-4">
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sign In
                    </Button>
                    <Button 
                      type="button" 
                      variant="link"
                      className="w-full text-sm"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Forgot your password?
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create account</CardTitle>
                  <CardDescription>
                    Get started with your morning routine
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleRegister}>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-firstName">First Name</Label>
                        <Input
                          id="register-firstName"
                          placeholder="First name"
                          value={registerForm.firstName}
                          onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-lastName">Last Name</Label>
                        <Input
                          id="register-lastName"
                          placeholder="Last name"
                          value={registerForm.lastName}
                          onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="Enter your email"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Create a password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        required
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Account
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Password Reset Modal */}
          {showForgotPassword && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Reset Password</CardTitle>
                <CardDescription>
                  {!showResetPassword 
                    ? "Enter your email to receive reset instructions"
                    : "Enter your email and new password"
                  }
                </CardDescription>
              </CardHeader>
              {!showResetPassword ? (
                <form onSubmit={handleForgotPassword}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Email</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="Enter your email"
                        value={resetForm.email}
                        onChange={(e) => setResetForm({ ...resetForm, email: e.target.value })}
                        required
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex space-x-2">
                    <Button 
                      type="submit" 
                      disabled={forgotPasswordMutation.isPending}
                    >
                      {forgotPasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Send Instructions
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setShowForgotPassword(false)}
                    >
                      Cancel
                    </Button>
                  </CardFooter>
                </form>
              ) : (
                <form onSubmit={handleResetPassword}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email-confirm">Email</Label>
                      <Input
                        id="reset-email-confirm"
                        type="email"
                        placeholder="Confirm your email"
                        value={resetForm.email}
                        onChange={(e) => setResetForm({ ...resetForm, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="Enter your new password"
                        value={resetForm.newPassword}
                        onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })}
                        required
                        minLength={6}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex space-x-2">
                    <Button 
                      type="submit" 
                      disabled={resetPasswordMutation.isPending}
                    >
                      {resetPasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Reset Password
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setShowResetPassword(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </CardFooter>
                </form>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* Right side - Hero Section */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-8 text-white">
        <div className="max-w-md text-center space-y-6">
          <h2 className="text-3xl font-bold">Start Your Day Right</h2>
          <p className="text-lg opacity-90">
            Help your children build healthy morning habits with our interactive 
            task management system. Track progress, earn points, and celebrate 
            achievements together.
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold mb-2">Track Tasks</h3>
              <p className="opacity-75">Create personalized morning routines</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold mb-2">Earn Points</h3>
              <p className="opacity-75">Reward completion with a points system</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold mb-2">Multiple Children</h3>
              <p className="opacity-75">Support for up to 3 children</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold mb-2">Visual Feedback</h3>
              <p className="opacity-75">Celebrate with confetti and animations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}