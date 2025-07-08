"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Shield, 
  Users, 
  Settings, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  AlertTriangle,
  CheckCircle,
  Package,
  DollarSign,
  FileText,
  BarChart3
} from "lucide-react"
import { useState } from "react"

interface DefaultPermission {
  id: string
  module: string
  icon: React.ComponentType<{ className?: string }>
  permissions: {
    read: boolean
    write: boolean
    delete: boolean
  }
  description: string
}

const defaultPermissions: DefaultPermission[] = [
  {
    id: "inventory",
    module: "Inventory Management",
    icon: Package,
    permissions: { read: true, write: false, delete: false },
    description: "Access to inventory, stock management, and warehouse operations"
  },
  {
    id: "financial",
    module: "Financial Management",
    icon: DollarSign,
    permissions: { read: true, write: false, delete: false },
    description: "Access to accounts, transactions, and financial reports"
  },
  {
    id: "documents",
    module: "Document Management",
    icon: FileText,
    permissions: { read: true, write: true, delete: false },
    description: "Access to invoices, purchase orders, and quotations"
  },
  {
    id: "reports",
    module: "Reporting & Analytics",
    icon: BarChart3,
    permissions: { read: true, write: false, delete: false },
    description: "Access to business intelligence and analytics reports"
  },
  {
    id: "parties",
    module: "Party Management",
    icon: Users,
    permissions: { read: true, write: true, delete: false },
    description: "Access to customers and suppliers management"
  }
]

export default function RightAccessDefaultPage() {
  const [permissions, setPermissions] = useState<DefaultPermission[]>(defaultPermissions)
  const [hasChanges, setHasChanges] = useState(false)

  const updatePermission = (moduleId: string, permissionType: 'read' | 'write' | 'delete', value: boolean) => {
    setPermissions(prev => prev.map(perm => {
      if (perm.id === moduleId) {
        const newPermissions = { ...perm.permissions, [permissionType]: value }
        
        // If write or delete is enabled, read must be enabled
        if ((permissionType === 'write' || permissionType === 'delete') && value) {
          newPermissions.read = true
        }
        
        // If read is disabled, write and delete must be disabled
        if (permissionType === 'read' && !value) {
          newPermissions.write = false
          newPermissions.delete = false
        }
        
        return { ...perm, permissions: newPermissions }
      }
      return perm
    }))
    setHasChanges(true)
  }

  const saveChanges = () => {
    // Here you would typically save to your backend
    console.log('Saving default permissions:', permissions)
    setHasChanges(false)
  }

  const resetToDefaults = () => {
    setPermissions(defaultPermissions)
    setHasChanges(false)
  }

  const getPermissionCount = (type: 'read' | 'write' | 'delete') => {
    return permissions.filter(perm => perm.permissions[type]).length
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Default Access Rights</h2>
          <p className="text-muted-foreground">
            Configure default permissions that will be applied to new team members
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <Button variant="outline" onClick={resetToDefaults}>
              Reset to Defaults
            </Button>
          )}
          <Button onClick={saveChanges} disabled={!hasChanges}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <Separator />

      {hasChanges && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have unsaved changes. Don&apos;t forget to save your default permission settings.
          </AlertDescription>
        </Alert>
      )}

      {/* Permission Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Read Access</p>
                <p className="text-2xl font-bold">{getPermissionCount('read')}</p>
              </div>
            </div>
            <Badge variant="secondary">{getPermissionCount('read')}/{permissions.length} modules</Badge>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-2">
              <Edit className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Write Access</p>
                <p className="text-2xl font-bold">{getPermissionCount('write')}</p>
              </div>
            </div>
            <Badge variant="secondary">{getPermissionCount('write')}/{permissions.length} modules</Badge>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">Delete Access</p>
                <p className="text-2xl font-bold">{getPermissionCount('delete')}</p>
              </div>
            </div>
            <Badge variant="secondary">{getPermissionCount('delete')}/{permissions.length} modules</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Permission Settings */}
      <div className="grid gap-4">
        {permissions.map((permission) => {
          const IconComponent = permission.icon
          return (
            <Card key={permission.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{permission.module}</CardTitle>
                      <CardDescription>{permission.description}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Read Permission */}
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4 text-blue-500" />
                      <Label htmlFor={`${permission.id}-read`} className="text-sm font-medium">
                        Read Access
                      </Label>
                    </div>
                    <Switch
                      id={`${permission.id}-read`}
                      checked={permission.permissions.read}
                      onCheckedChange={(checked) => updatePermission(permission.id, 'read', checked)}
                    />
                  </div>

                  {/* Write Permission */}
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-2">
                      <Edit className="h-4 w-4 text-green-500" />
                      <Label htmlFor={`${permission.id}-write`} className="text-sm font-medium">
                        Write Access
                      </Label>
                    </div>
                    <Switch
                      id={`${permission.id}-write`}
                      checked={permission.permissions.write}
                      onCheckedChange={(checked) => updatePermission(permission.id, 'write', checked)}
                      disabled={!permission.permissions.read}
                    />
                  </div>

                  {/* Delete Permission */}
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-2">
                      <Trash2 className="h-4 w-4 text-red-500" />
                      <Label htmlFor={`${permission.id}-delete`} className="text-sm font-medium">
                        Delete Access
                      </Label>
                    </div>
                    <Switch
                      id={`${permission.id}-delete`}
                      checked={permission.permissions.delete}
                      onCheckedChange={(checked) => updatePermission(permission.id, 'delete', checked)}
                      disabled={!permission.permissions.read}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Permission Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Eye className="h-4 w-4 text-blue-500" />
                Read Access
              </h4>
              <p className="text-muted-foreground">
                Allows users to view and browse data within the module
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Edit className="h-4 w-4 text-green-500" />
                Write Access
              </h4>
              <p className="text-muted-foreground">
                Allows users to create and modify data (requires Read access)
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-red-500" />
                Delete Access
              </h4>
              <p className="text-muted-foreground">
                Allows users to delete data (requires Read access)
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Default Permissions
              </h4>
              <p className="text-muted-foreground">
                These settings apply to all new team members automatically
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}