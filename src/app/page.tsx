import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function Home() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Turn Your Child&apos;s Growth into
            <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              AI-Powered Stories
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Simply upload photos and let AI automatically generate growth records and comments,
            then create beautiful storybooks to preserve precious memories.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-4 bg-pink-500 hover:bg-pink-600">
              📸 Upload Photos
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4">
              View Demo
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center p-6 hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📷</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Upload</h3>
            <p className="text-gray-600">
              Simply select photos to start recording your child&apos;s growth journey
            </p>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Generation</h3>
            <p className="text-gray-600">
              AI analyzes photos and automatically generates heartwarming comments
            </p>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Storybook Creation</h3>
            <p className="text-gray-600">
              Create original storybooks from monthly growth records
            </p>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-0 p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Get started for free and preserve your child&apos;s precious moments
            as beautiful stories.
          </p>
          <Button size="lg" className="text-lg px-8 py-4 bg-pink-500 hover:bg-pink-600">
            Get Started Free
          </Button>
        </Card>
      </div>
    </Layout>
  )
}
