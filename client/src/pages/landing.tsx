import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, Star, Users, Sun, Sparkles } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          {/* Sunshine Squad Banner */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <Sun className="h-16 w-16 md:h-20 md:w-20 text-yellow-500" />
              <Sparkles className="h-8 w-8 md:h-10 md:w-10 text-orange-400 absolute -top-2 -right-2" />
            </div>
            <div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                Sunshine Squad
              </h1>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="h-2 w-12 md:w-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"></div>
                <Sun className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
                <div className="h-2 w-12 md:w-16 bg-gradient-to-r from-orange-400 to-red-400 rounded-full"></div>
              </div>
            </div>
          </div>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
            Transform your family's mornings with fun, interactive task management
          </p>
          <Button 
            size="lg" 
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg"
            onClick={() => window.location.href = '/api/login'}
          >
            Get Started
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-lg">Task Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Create and track daily routines with easy-to-use task lists
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-lg">Points & Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Motivate children with a comprehensive points and rewards system
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-lg">Multi-Child Support</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Manage routines for up to three children with individual profiles
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle className="text-lg">Smart Scheduling</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Weekday-specific tasks with time-based point bonuses
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Transform Your Mornings?</CardTitle>
              <CardDescription className="text-lg">
                Join families who have made mornings easier and more enjoyable with our interactive routine app.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                size="lg"
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-3"
                onClick={() => window.location.href = '/api/login'}
              >
                Sign In to Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}