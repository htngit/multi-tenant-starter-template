import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Download, 
  BookOpen, 
  ChefHat,
  Clock,
  Users,
  Package,
  Layers,
  TrendingUp,
  Search,
  Filter,
  BarChart3,
  FileText,
  Eye,
  Edit,
  Copy,
  RefreshCw,
  Target,
  Activity,
  Zap,
  Settings,
  Timer,
  Wrench,
  Clipboard,
  PieChart,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Star,
  Beaker,
  Scale,
  Thermometer,
  Calendar,
  User,
  Factory,
  Archive,
  Share2
} from "lucide-react";

export const metadata: Metadata = {
  title: "Production Template Recipe | XalesIn ERP",
  description: "Production recipe templates and manufacturing formulas",
};

/**
 * Production Template Recipe Management Page Component
 * 
 * Features:
 * - Manage production recipes and formulas
 * - Template creation and standardization
 * - Ingredient and material specifications
 * - Process steps and quality parameters
 * 
 * @returns JSX.Element - Production template recipe management interface
 */
export default function ProductionTemplateRecipePage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Production Template Recipe</h2>
          <p className="text-muted-foreground">
            Production recipe templates and manufacturing formulas
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Templates
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Data
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Recipe Template
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recipes</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">
              +3 new this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Templates</CardTitle>
            <ChefHat className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
            <p className="text-xs text-muted-foreground">
              Currently in use
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recipe Categories</CardTitle>
            <Layers className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Product categories
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">
              Recipe accuracy
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search recipe templates by name, category, or ingredients..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recipe Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Recipe Templates</CardTitle>
          <CardDescription>
            Production recipe templates and manufacturing formulas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                id: "RT-2024-001",
                name: "Wireless Bluetooth Headphones v2.1",
                category: "Electronics",
                version: "2.1",
                status: "Active",
                complexity: "High",
                duration: "4.5 hours",
                yield: "95%",
                ingredients: 12,
                steps: 8,
                lastUpdated: "2024-01-15",
                createdBy: "John Smith",
                usageCount: 45,
                rating: 4.8
              },
              {
                id: "RT-2024-002",
                name: "Organic Cotton T-Shirt Basic",
                category: "Textile",
                version: "1.3",
                status: "Active",
                complexity: "Medium",
                duration: "2.0 hours",
                yield: "98%",
                ingredients: 6,
                steps: 5,
                lastUpdated: "2024-01-12",
                createdBy: "Sarah Wilson",
                usageCount: 78,
                rating: 4.9
              },
              {
                id: "RT-2024-003",
                name: "Stainless Steel Water Bottle 500ml",
                category: "Metal Works",
                version: "1.0",
                status: "Draft",
                complexity: "Medium",
                duration: "3.2 hours",
                yield: "92%",
                ingredients: 8,
                steps: 6,
                lastUpdated: "2024-01-16",
                createdBy: "Mike Johnson",
                usageCount: 12,
                rating: 4.5
              },
              {
                id: "RT-2024-004",
                name: "Laptop Stand Adjustable Pro",
                category: "Assembly",
                version: "2.0",
                status: "Active",
                complexity: "Low",
                duration: "1.5 hours",
                yield: "97%",
                ingredients: 4,
                steps: 4,
                lastUpdated: "2024-01-10",
                createdBy: "Lisa Chen",
                usageCount: 34,
                rating: 4.7
              },
              {
                id: "RT-2024-005",
                name: "Smart Fitness Tracker Gen3",
                category: "Electronics",
                version: "3.0",
                status: "Under Review",
                complexity: "High",
                duration: "6.0 hours",
                yield: "89%",
                ingredients: 15,
                steps: 12,
                lastUpdated: "2024-01-17",
                createdBy: "David Brown",
                usageCount: 8,
                rating: 4.3
              }
            ].map((recipe, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{recipe.name}</p>
                      <Badge 
                        variant={
                          recipe.status === "Active" ? "default" : 
                          recipe.status === "Draft" ? "secondary" : 
                          recipe.status === "Under Review" ? "outline" : "destructive"
                        }
                      >
                        {recipe.status}
                      </Badge>
                      <Badge variant="outline">{recipe.category}</Badge>
                      <Badge 
                        variant={
                          recipe.complexity === "High" ? "destructive" : 
                          recipe.complexity === "Medium" ? "default" : "secondary"
                        }
                      >
                        {recipe.complexity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{recipe.id} • Version {recipe.version}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{recipe.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Target className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{recipe.yield} yield</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{recipe.createdBy}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{recipe.lastUpdated}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  {/* Ingredients */}
                  <div className="text-center">
                    <p className="text-sm font-medium">{recipe.ingredients}</p>
                    <p className="text-xs text-muted-foreground">Ingredients</p>
                  </div>
                  
                  {/* Steps */}
                  <div className="text-center">
                    <p className="text-sm font-medium">{recipe.steps}</p>
                    <p className="text-xs text-muted-foreground">Steps</p>
                  </div>
                  
                  {/* Usage Count */}
                  <div className="text-center">
                    <p className="text-sm font-medium">{recipe.usageCount}</p>
                    <p className="text-xs text-muted-foreground">Used</p>
                  </div>
                  
                  {/* Rating */}
                  <div className="text-center">
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{recipe.rating}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recipe Categories and Template Usage */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recipe Categories</CardTitle>
            <CardDescription>Distribution by product category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { category: "Electronics", count: 15, templates: 12, percentage: 32, color: "bg-blue-600" },
                { category: "Textile", count: 12, templates: 8, percentage: 26, color: "bg-green-600" },
                { category: "Metal Works", count: 8, templates: 6, percentage: 17, color: "bg-gray-600" },
                { category: "Assembly", count: 7, templates: 4, percentage: 15, color: "bg-purple-600" },
                { category: "Chemical", count: 3, templates: 2, percentage: 6, color: "bg-orange-600" },
                { category: "Food & Beverage", count: 2, templates: 0, percentage: 4, color: "bg-red-600" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Layers className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <span className="text-sm font-medium">{item.category}</span>
                      <p className="text-xs text-muted-foreground">{item.count} recipes • {item.templates} active</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full">
                      <div 
                        className={`h-2 ${item.color} rounded-full`} 
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Template Usage Analytics</CardTitle>
            <CardDescription>Most used and popular templates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  template: "Organic Cotton T-Shirt Basic",
                  category: "Textile",
                  usageCount: 78,
                  successRate: 98,
                  rating: 4.9
                },
                {
                  template: "Wireless Bluetooth Headphones v2.1",
                  category: "Electronics",
                  usageCount: 45,
                  successRate: 95,
                  rating: 4.8
                },
                {
                  template: "Laptop Stand Adjustable Pro",
                  category: "Assembly",
                  usageCount: 34,
                  successRate: 97,
                  rating: 4.7
                },
                {
                  template: "Stainless Steel Water Bottle 500ml",
                  category: "Metal Works",
                  usageCount: 12,
                  successRate: 92,
                  rating: 4.5
                }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <ChefHat className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.template}</p>
                      <p className="text-xs text-muted-foreground">{item.category} • {item.usageCount} uses</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{item.rating}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.successRate}% success</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recipe Performance and Quality Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recipe Performance Metrics</CardTitle>
            <CardDescription>Key performance indicators for recipes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Target className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Average Yield</span>
                </div>
                <span className="text-lg font-bold">94.2%</span>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Avg. Production Time</span>
                </div>
                <span className="text-lg font-bold">3.4 hrs</span>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium">Success Rate</span>
                </div>
                <span className="text-lg font-bold">96.8%</span>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Star className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm font-medium">Avg. Rating</span>
                </div>
                <span className="text-lg font-bold">4.6/5</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quality Control Parameters</CardTitle>
            <CardDescription>Recipe quality and compliance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  parameter: "Temperature Control",
                  compliance: 98,
                  status: "Excellent",
                  icon: Thermometer
                },
                {
                  parameter: "Ingredient Accuracy",
                  compliance: 96,
                  status: "Good",
                  icon: Scale
                },
                {
                  parameter: "Process Timing",
                  compliance: 94,
                  status: "Good",
                  icon: Timer
                },
                {
                  parameter: "Quality Standards",
                  compliance: 97,
                  status: "Excellent",
                  icon: Beaker
                }
              ].map((param, index) => {
                const IconComponent = param.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        param.compliance >= 95 ? "bg-green-100" : "bg-yellow-100"
                      }`}>
                        <IconComponent className={`h-4 w-4 ${
                          param.compliance >= 95 ? "text-green-600" : "text-yellow-600"
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{param.parameter}</p>
                        <p className="text-xs text-muted-foreground">{param.status}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{param.compliance}%</p>
                      <div className="w-16 h-2 bg-gray-200 rounded-full mt-1">
                        <div 
                          className={`h-2 rounded-full ${
                            param.compliance >= 95 ? "bg-green-600" : "bg-yellow-600"
                          }`}
                          style={{ width: `${param.compliance}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common recipe management operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Button variant="outline" className="justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Create New Recipe
              </Button>
              <Button variant="outline" className="justify-start">
                <Copy className="mr-2 h-4 w-4" />
                Duplicate Template
              </Button>
              <Button variant="outline" className="justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Export Recipe
              </Button>
              <Button variant="outline" className="justify-start">
                <Share2 className="mr-2 h-4 w-4" />
                Share Template
              </Button>
              <Button variant="outline" className="justify-start">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
              <Button variant="outline" className="justify-start">
                <Archive className="mr-2 h-4 w-4" />
                Archive Old Versions
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Recipe Activity</CardTitle>
            <CardDescription>Latest updates and modifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  action: "Recipe Updated",
                  recipe: "Smart Fitness Tracker Gen3",
                  user: "David Brown",
                  time: "2 hours ago",
                  type: "update"
                },
                {
                  action: "New Recipe Created",
                  recipe: "Wireless Earbuds Pro",
                  user: "John Smith",
                  time: "4 hours ago",
                  type: "create"
                },
                {
                  action: "Recipe Approved",
                  recipe: "Organic Cotton T-Shirt v1.4",
                  user: "Sarah Wilson",
                  time: "6 hours ago",
                  type: "approve"
                },
                {
                  action: "Template Duplicated",
                  recipe: "Laptop Stand Basic",
                  user: "Lisa Chen",
                  time: "8 hours ago",
                  type: "duplicate"
                }
              ].map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === "create" ? "bg-green-100" :
                    activity.type === "update" ? "bg-blue-100" :
                    activity.type === "approve" ? "bg-purple-100" : "bg-gray-100"
                  }`}>
                    {activity.type === "create" ? (
                      <Plus className="h-4 w-4 text-green-600" />
                    ) : activity.type === "update" ? (
                      <Edit className="h-4 w-4 text-blue-600" />
                    ) : activity.type === "approve" ? (
                      <CheckCircle className="h-4 w-4 text-purple-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.recipe}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.user} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recipe Template Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Recipe Template Statistics</CardTitle>
          <CardDescription>Overall template performance and usage statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 border rounded-lg">
              <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">47</p>
              <p className="text-sm text-muted-foreground">Total Templates</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Factory className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">234</p>
              <p className="text-sm text-muted-foreground">Productions Made</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">94.2%</p>
              <p className="text-sm text-muted-foreground">Average Success Rate</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">4.6</p>
              <p className="text-sm text-muted-foreground">Average Rating</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}