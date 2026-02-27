import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Calendar, FileText, Settings, Mail } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Building2 className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Bramhollow Condominium Assoc Inc</h1>
                <p className="text-sm text-gray-600 font-medium">Established in 1985</p>
                <p className="text-xs text-gray-500">Community Management Portal</p>
              </div>
            </div>
            <Button onClick={() => window.location.href = '/api/login'}>
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Welcome to Your Community Portal
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Everything you need to manage your condominium community in one place. 
            From service requests to newsletters, stay connected with your neighbors and building management.
          </p>
          <Button size="lg" onClick={() => window.location.href = '/api/login'}>
            Get Started
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Community Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Settings className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Service Requests</CardTitle>
                <CardDescription>
                  Submit and track maintenance requests for your unit and common areas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Easy online submission</li>
                  <li>• Real-time status updates</li>
                  <li>• Photo attachments</li>
                  <li>• Priority handling</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Calendar className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Events & Meetings</CardTitle>
                <CardDescription>
                  Stay informed about community events and board meetings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Event calendar</li>
                  <li>• RSVP functionality</li>
                  <li>• Meeting reminders</li>
                  <li>• Community activities</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Amenity Reservations</CardTitle>
                <CardDescription>
                  Book community spaces and amenities with ease
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Common area booking</li>
                  <li>• Party room reservations</li>
                  <li>• Guest parking</li>
                  <li>• Conflict prevention</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <FileText className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Documents & Notices</CardTitle>
                <CardDescription>
                  Access important community documents and announcements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Financial statements</li>
                  <li>• Board minutes</li>
                  <li>• Building policies</li>
                  <li>• Insurance documents</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Mail className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Newsletters</CardTitle>
                <CardDescription>
                  Quarterly community newsletters with important updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Community updates</li>
                  <li>• Financial summaries</li>
                  <li>• Upcoming projects</li>
                  <li>• Resident spotlights</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Building2 className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Building Management</CardTitle>
                <CardDescription>
                  Comprehensive tools for property managers and board members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Unit management</li>
                  <li>• Resident directory</li>
                  <li>• Maintenance tracking</li>
                  <li>• Financial oversight</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-8 bg-red-50 border-t-4 border-red-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4">
            <h3 className="text-lg font-extrabold text-red-900 uppercase tracking-wide">
              OFFICIAL NOTICE — DIGITAL COMMUNICATION POLICY
            </h3>
            <p className="text-sm text-red-800 font-bold mt-1">
              Effective: March 1, 2026 | Until Formally Rescinded
            </p>
          </div>
          <div className="bg-white rounded-lg p-5 border border-red-300 shadow-sm">
            <p className="text-sm text-red-900 leading-relaxed mb-3 font-semibold">
              Pursuant to N.J.S.A. 12A:12-1 et seq. (NJ Uniform Electronic Transactions Act) and
              N.J.S.A. 46:8B-12:
            </p>
            <p className="text-sm text-red-900 leading-relaxed mb-2">
              This website serves as the <span className="font-bold underline">official and primary communication channel</span> for
              Bramhollow Condominium Association Inc. All notices posted here constitute valid notice
              to all unit owners, residents, and principals.
            </p>
            <p className="text-sm text-red-900 leading-relaxed font-semibold">
              All owners are required to regularly monitor this website for Association business,
              meeting notices, policy updates, and official correspondence. Sign in to access full
              details.
            </p>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center space-x-3 mb-1">
              <Building2 className="w-6 h-6" />
              <span className="text-lg font-semibold">Bramhollow Condominium Assoc Inc</span>
            </div>
            <p className="text-sm text-gray-400">Established in 1985</p>
          </div>
          <p className="text-gray-400 mb-4">
            Building stronger communities through better communication and management.
          </p>
          <p className="text-xs text-gray-500 border-t border-gray-700 pt-4">
            This repository is maintained for Statutory Compliance with N.J.S.A. 46:8B-1 et seq.
          </p>
        </div>
      </footer>
    </div>
  );
}