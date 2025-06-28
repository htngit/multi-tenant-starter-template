import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Shield, Users, Bell, Database, Key } from "lucide-react";

export const metadata: Metadata = {
  title: "Settings | XalesIn ERP",
  description: "System configuration, security settings, and organizational preferences.",
};

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Database className="mr-2 h-4 w-4" />
            Backup
          </Button>
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Users
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">0</div>
            <p className="text-xs text-muted-foreground">
              Licensed user accounts
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Security Score
            </CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">100%</div>
            <p className="text-xs text-muted-foreground">
              System security rating
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Data Storage
            </CardTitle>
            <Database className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">0 GB</div>
            <p className="text-xs text-muted-foreground">
              Used storage space
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              API Calls
            </CardTitle>
            <Key className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">0</div>
            <p className="text-xs text-muted-foreground">
              This month's usage
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Organization Settings</CardTitle>
            <CardDescription>
              Configure your organization's basic information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Organization Name</label>
                <div className="text-sm text-muted-foreground">Not configured</div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Business Type</label>
                <div className="text-sm text-muted-foreground">Not specified</div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Time Zone</label>
                <div className="text-sm text-muted-foreground">UTC</div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Currency</label>
                <div className="text-sm text-muted-foreground">USD</div>
              </div>
              <Button variant="outline" className="w-full">
                <Settings className="mr-2 h-4 w-4" />
                Configure Organization
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Security Configuration</CardTitle>
            <CardDescription>
              Manage security policies and access controls
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Two-Factor Authentication</span>
                <span className="text-sm text-green-600">Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Password Policy</span>
                <span className="text-sm text-green-600">Strong</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Session Timeout</span>
                <span className="text-sm text-muted-foreground">8 hours</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">IP Restrictions</span>
                <span className="text-sm text-muted-foreground">Disabled</span>
              </div>
              <Button variant="outline" className="w-full">
                <Shield className="mr-2 h-4 w-4" />
                Security Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Manage user accounts and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Key className="mr-2 h-4 w-4" />
                Role Permissions
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="mr-2 h-4 w-4" />
                Access Control
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Configure system notifications and alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Email Notifications</span>
                <span className="text-sm text-green-600">Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Security Alerts</span>
                <span className="text-sm text-green-600">Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">System Updates</span>
                <span className="text-sm text-green-600">Enabled</span>
              </div>
              <Button variant="outline" className="w-full">
                <Bell className="mr-2 h-4 w-4" />
                Notification Settings
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>System Maintenance</CardTitle>
            <CardDescription>
              System backup and maintenance tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Database className="mr-2 h-4 w-4" />
                Create Backup
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                System Health
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Key className="mr-2 h-4 w-4" />
                API Management
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Integration Settings</CardTitle>
            <CardDescription>
              Configure third-party integrations and APIs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Payment Gateway</span>
                <span className="text-sm text-muted-foreground">Not configured</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Email Service</span>
                <span className="text-sm text-muted-foreground">Not configured</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">SMS Service</span>
                <span className="text-sm text-muted-foreground">Not configured</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cloud Storage</span>
                <span className="text-sm text-muted-foreground">Not configured</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Advanced Settings</CardTitle>
            <CardDescription>
              Advanced system configuration options
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Debug Mode</span>
                <span className="text-sm text-muted-foreground">Disabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Maintenance Mode</span>
                <span className="text-sm text-muted-foreground">Disabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Auto Backup</span>
                <span className="text-sm text-green-600">Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Data Retention</span>
                <span className="text-sm text-muted-foreground">90 days</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}