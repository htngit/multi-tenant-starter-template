"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, Edit, Trash2, Users, Shield, Lock } from "lucide-react"
import { useState } from "react"

interface CustomRight {
  id: string
  name: string
  description: string
  permissions: string[]
  assignedUsers: number
  createdAt: string
  updatedAt: string
}

const mockCustomRights: CustomRight[] = [
  {
    id: "1",
    name: "Sales Manager",
    description: "Full access to sales module with reporting capabilities",
    permissions: ["sales.read", "sales.write", "sales.delete", "reports.sales"],
    assignedUsers: 3,
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20"
  },
  {
    id: "2",
    name: "Inventory Supervisor",
    description: "Manage inventory with stock movement permissions",
    permissions: ["inventory.read", "inventory.write", "stock.movement"],
    assignedUsers: 2,
    createdAt: "2024-01-10",
    updatedAt: "2024-01-18"
  },
  {
    id: "3",
    name: "Financial Analyst",
    description: "Read-only access to financial data and reports",
    permissions: ["financial.read", "reports.financial", "analytics.view"],
    assignedUsers: 1,
    createdAt: "2024-01-12",
    updatedAt: "2024-01-16"
  }
]

export default function CustomRightAccessPage() {
  const [customRights, setCustomRights] = useState<CustomRight[]>(mockCustomRights)
  const [isCreating, setIsCreating] = useState(false)
  const [newRight, setNewRight] = useState({
    name: "",
    description: "",
    permissions: [] as string[]
  })

  const handleCreateRight = () => {
    if (newRight.name && newRight.description) {
      const right: CustomRight = {
        id: Date.now().toString(),
        name: newRight.name,
        description: newRight.description,
        permissions: newRight.permissions,
        assignedUsers: 0,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      }
      setCustomRights([...customRights, right])
      setNewRight({ name: "", description: "", permissions: [] })
      setIsCreating(false)
    }
  }

  const handleDeleteRight = (id: string) => {
    setCustomRights(customRights.filter(right => right.id !== id))
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Custom Right Access</h2>
          <p className="text-muted-foreground">
            Create and manage custom access rights for your team members
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Custom Right
          </Button>
        </div>
      </div>

      <Separator />

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Create New Custom Right
            </CardTitle>
            <CardDescription>
              Define a new custom access right with specific permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Right Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Sales Manager"
                  value={newRight.name}
                  onChange={(e) => setNewRight({ ...newRight, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="permissions">Permissions (comma-separated)</Label>
                <Input
                  id="permissions"
                  placeholder="e.g., sales.read, sales.write"
                  onChange={(e) => setNewRight({ 
                    ...newRight, 
                    permissions: e.target.value.split(',').map(p => p.trim()).filter(p => p) 
                  })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this custom right allows..."
                value={newRight.description}
                onChange={(e) => setNewRight({ ...newRight, description: e.target.value })}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRight}>
                Create Right
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {customRights.map((right) => (
          <Card key={right.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle>{right.name}</CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {right.assignedUsers} users
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDeleteRight(right.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>{right.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Permissions</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {right.permissions.map((permission, index) => (
                      <Badge key={index} variant="outline">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">Created:</span> {right.createdAt}
                  </div>
                  <div>
                    <span className="font-medium">Updated:</span> {right.updatedAt}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {customRights.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Lock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Custom Rights Created</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first custom access right to manage team permissions
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Custom Right
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}