import Image from 'next/image'

export const Footer = () => {
  return (
    <footer className="bg-gray-100 py-8 mt-10 border-t">
      <div className="max-w-6xl mx-auto px-4 flex flex-col items-center space-y-6 text-center">
        {/* Logos */}
        <div className="flex flex-wrap justify-center items-center gap-8">
          <Image src="/ai-aloe_logo.jpg" alt="AI-ALOE Logo" width={192} height={64} />
          <Image src="/dilab.png" alt="DILab Logo" width={192} height={64} />
          <Image src="/gt_logo.png" alt="Georgia Tech Logo" width={192} height={64} />
        </div>

        {/* Caption */}
        <p className="text-base text-gray-700 max-w-3xl leading-relaxed">
          Developed by the <strong>Design Intelligence Laboratory (DILab)</strong> and the{' '}
          <strong>National AI Institute for Adult Learning and Online Education (AI-ALOE)</strong> at{' '}
          <strong>Georgia Institute of Technology</strong>.
        </p>
      </div>
    </footer>
  )
}