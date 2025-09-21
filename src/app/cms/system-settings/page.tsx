"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Database, Mail, Shield, Save } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function CMSSettingsPage() {
  const { t } = useTranslation("cms", {
    useDynamic: true,
    fallbackToStatic: true,
  });
  const { t: tCommon } = useTranslation("common", {
    useDynamic: true,
    fallbackToStatic: true,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t("settings.title")}
        </h1>
        <p className="text-gray-600">{t("settings.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>{t("settings.general_settings")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="app-name">Application Name</Label>
              <Input id="app-name" defaultValue="School Management System" />
            </div>
            <div>
              <Label htmlFor="app-url">Application URL</Label>
              <Input id="app-url" defaultValue="https://school.example.com" />
            </div>
            <div>
              <Label htmlFor="timezone">Default Timezone</Label>
              <Input id="timezone" defaultValue="Europe/Brussels" />
            </div>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              {tCommon("save")}
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>{t("settings.security_settings")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
              <Input id="session-timeout" type="number" defaultValue="60" />
            </div>
            <div>
              <Label htmlFor="password-policy">Minimum Password Length</Label>
              <Input id="password-policy" type="number" defaultValue="6" />
            </div>
            <div>
              <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
              <Input id="max-login-attempts" type="number" defaultValue="5" />
            </div>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              {tCommon("save")}
            </Button>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>{t("settings.email_settings")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="smtp-host">SMTP Host</Label>
              <Input id="smtp-host" placeholder="smtp.example.com" />
            </div>
            <div>
              <Label htmlFor="smtp-port">SMTP Port</Label>
              <Input id="smtp-port" type="number" defaultValue="587" />
            </div>
            <div>
              <Label htmlFor="from-email">From Email</Label>
              <Input
                id="from-email"
                type="email"
                placeholder="noreply@school.com"
              />
            </div>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              {tCommon("save")}
            </Button>
          </CardContent>
        </Card>

        {/* Database Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>{t("settings.database_settings")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                Database Status:{" "}
                <span className="text-green-600 font-medium">Connected</span>
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Last Backup: <span className="font-medium">2 hours ago</span>
              </p>
              <p className="text-sm text-gray-600">
                Database Size: <span className="font-medium">245 MB</span>
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Database className="h-4 w-4 mr-2" />
                Backup Now
              </Button>
              <Button variant="outline">Test Connection</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
