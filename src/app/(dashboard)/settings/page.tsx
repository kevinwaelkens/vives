"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Mail,
  Lock,
  Bell,
  Globe,
  Shield,
  Database,
  Save,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useTranslation } from "@/lib/i18n";

export default function SettingsPage() {
  const { t } = useTranslation("settings", { useDynamic: true });
  const { t: tCommon } = useTranslation("common", { useDynamic: true });
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("profile");
  const [profileData, setProfileData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    taskReminders: true,
    gradeUpdates: true,
    attendanceAlerts: true,
    weeklyReports: false,
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile updated successfully");
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    toast.success("Password changed successfully");
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleNotificationUpdate = () => {
    toast.success("Notification preferences updated");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1>
        <p className="text-gray-600 mt-1">{t("subtitle")}</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeTab === "profile"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          <User className="h-4 w-4 inline mr-2" />
          {t("tabs.profile")}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeTab === "security"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          <Lock className="h-4 w-4 inline mr-2" />
          {t("tabs.security")}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("notifications")}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeTab === "notifications"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          <Bell className="h-4 w-4 inline mr-2" />
          {t("tabs.notifications")}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("system")}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeTab === "system"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          <Globe className="h-4 w-4 inline mr-2" />
          {t("tabs.system")}
        </button>
      </div>

      {/* Profile Settings */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("profile.title")}</CardTitle>
                <CardDescription>{t("profile.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <Label htmlFor="name">{t("profile.full_name")}</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData({ ...profileData, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">{t("profile.email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">{t("profile.phone")}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          phone: e.target.value,
                        })
                      }
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    {tCommon("save_changes")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Account Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Account Type</p>
                  <p className="font-medium capitalize">
                    {session?.user?.role?.toLowerCase()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="font-medium">January 2024</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Login</p>
                  <p className="font-medium">Today at 9:00 AM</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Security Settings */}
      {activeTab === "security" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("security.change_password")}</CardTitle>
              <CardDescription>
                Ensure your account stays secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">
                    {t("security.current_password")}
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">
                    {t("security.new_password")}
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">
                    {t("security.confirm_password")}
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <Button type="submit">
                  <Lock className="h-4 w-4 mr-2" />
                  {tCommon("change_password")}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Additional security options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-600">
                    Add an extra layer of security
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Enable
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Login Alerts</p>
                  <p className="text-sm text-gray-600">
                    Get notified of new logins
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Active Sessions</p>
                  <p className="text-sm text-gray-600">
                    Manage your active sessions
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notification Settings */}
      {activeTab === "notifications" && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>
              Choose what notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-600">
                    Receive updates via email
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.emailNotifications}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      emailNotifications: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Task Reminders</p>
                  <p className="text-sm text-gray-600">
                    Get reminded about upcoming tasks
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.taskReminders}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      taskReminders: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Grade Updates</p>
                  <p className="text-sm text-gray-600">
                    Notify when grades are posted
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.gradeUpdates}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      gradeUpdates: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Attendance Alerts</p>
                  <p className="text-sm text-gray-600">
                    Alert for attendance issues
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.attendanceAlerts}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      attendanceAlerts: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Weekly Reports</p>
                  <p className="text-sm text-gray-600">
                    Receive weekly summary reports
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.weeklyReports}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      weeklyReports: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
              </div>
              <Button onClick={handleNotificationUpdate}>
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Settings */}
      {activeTab === "system" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Version</p>
                <p className="font-medium">1.0.0</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Database Status</p>
                <p className="font-medium text-green-600">Connected</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Backup</p>
                <p className="font-medium">Today at 3:00 AM</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Storage Used</p>
                <p className="font-medium">2.3 GB / 10 GB</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Export Data</p>
                  <p className="text-sm text-gray-600">
                    Download all your data
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Database className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Clear Cache</p>
                  <p className="text-sm text-gray-600">Clear temporary data</p>
                </div>
                <Button variant="outline" size="sm">
                  Clear
                </Button>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">Danger Zone</p>
                    <p className="text-sm text-red-700 mt-1">
                      Delete your account and all associated data. This action
                      cannot be undone.
                    </p>
                    <Button variant="destructive" size="sm" className="mt-3">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
