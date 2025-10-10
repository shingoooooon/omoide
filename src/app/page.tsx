import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

export default function Home() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-neutral-900 mb-6 font-display">
            Turn Your Child's Growth into
            <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              AI-Powered Stories
            </span>
          </h1>
          <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
            Simply upload photos and let AI automatically generate growth records and comments,
            then create beautiful storybooks to preserve precious memories.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-4">
              📸 Upload Photos
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4">
              View Demo
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center hover:shadow-large transition-all duration-300">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📷</span>
              </div>
              <CardTitle>Easy Upload</CardTitle>
              <CardDescription>
                Simply select photos to start recording your child's growth journey
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-large transition-all duration-300">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <CardTitle>AI Generation</CardTitle>
              <CardDescription>
                AI analyzes photos and automatically generates heartwarming comments
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-large transition-all duration-300">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <CardTitle>Storybook Creation</CardTitle>
              <CardDescription>
                Create original storybooks from monthly growth records
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-primary-50 to-secondary-50 border-0">
          <CardContent className="text-center py-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-neutral-600 mb-8 max-w-md mx-auto">
              Get started for free and preserve your child's precious moments
              as beautiful stories.
            </p>
            <Button size="lg" className="text-lg px-8 py-4">
              Get Started Free
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
