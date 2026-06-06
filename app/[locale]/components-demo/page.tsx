"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

import { useTranslations } from "next-intl";

export default function ComponentsDemo() {
  const t = useTranslations("ComponentsDemo");
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("description")}
        </p>
      </div>

      {/* Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>{t("buttonsTitle")}</CardTitle>
          <CardDescription>{t("buttonsDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button>{t("buttonDefault")}</Button>
            <Button variant="secondary">{t("buttonSecondary")}</Button>
            <Button variant="outline">{t("buttonOutline")}</Button>
            <Button variant="ghost">{t("buttonGhost")}</Button>
            <Button variant="link">{t("buttonLink")}</Button>
            <Button variant="destructive">{t("buttonDestructive")}</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm">{t("buttonSm")}</Button>
            <Button size="default">{t("buttonDefault")}</Button>
            <Button size="lg">{t("buttonLg")}</Button>
            <Button size="icon">
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Form Components */}
      <Card>
        <CardHeader>
          <CardTitle>{t("formTitle")}</CardTitle>
          <CardDescription>{t("formDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="email">{t("email")}</Label>
            <Input type="email" id="email" placeholder={t("emailPlaceholder")} />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="password">{t("password")}</Label>
            <Input type="password" id="password" placeholder={t("passwordPlaceholder")} />
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle>{t("badgesTitle")}</CardTitle>
          <CardDescription>{t("badgesDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge>{t("badgeDefault")}</Badge>
            <Badge variant="secondary">{t("badgeSecondary")}</Badge>
            <Badge variant="outline">{t("badgeOutline")}</Badge>
            <Badge variant="destructive">{t("badgeDestructive")}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>{t("alertsTitle")}</CardTitle>
          <CardDescription>{t("alertsDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t("alertInfo")}</AlertTitle>
            <AlertDescription>
              {t("alertInfoDesc")}
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t("alertError")}</AlertTitle>
            <AlertDescription>
              {t("alertErrorDesc")}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Cards */}
      <Card>
        <CardHeader>
          <CardTitle>{t("cardsTitle")}</CardTitle>
          <CardDescription>{t("cardsDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("card1Title")}</CardTitle>
                <CardDescription>{t("card1Desc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{t("card1Content")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t("card2Title")}</CardTitle>
                <CardDescription>{t("card2Desc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{t("card2Content")}</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}