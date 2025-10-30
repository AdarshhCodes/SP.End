import { useRef } from 'react';
import { Award, Download, Share2 } from 'lucide-react';

type CertificateProps = {
  userName: string;
  badgeName: string;
  badgeDescription: string;
  earnedDate: string;
  onClose: () => void;
};

export default function Certificate({
  userName,
  badgeName,
  badgeDescription,
  earnedDate,
  onClose,
}: CertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!certificateRef.current) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(certificateRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      const link = document.createElement('a');
      link.download = `${badgeName.replace(/\s+/g, '_')}_Certificate.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('Failed to download certificate. Please try again.');
    }
  };

  const handleShare = async () => {
    if (!certificateRef.current) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(certificateRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const file = new File([blob], `${badgeName.replace(/\s+/g, '_')}_Certificate.png`, {
          type: 'image/png',
        });

        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `${badgeName} Certificate`,
            text: `I earned the ${badgeName} badge on SP.End!`,
          });
        } else {
          alert(
            'Sharing is not supported on this device. Please download the certificate instead.'
          );
        }
      });
    } catch (error) {
      console.error('Error sharing certificate:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div
          ref={certificateRef}
          className="bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50 p-12 rounded-xl border-8 border-double border-teal-600"
        >
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl">
                <Award className="w-14 h-14 text-white" />
              </div>
            </div>

            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600 mb-2">
                Certificate of Achievement
              </h1>
              <div className="h-1 w-32 bg-gradient-to-r from-teal-500 to-blue-600 mx-auto rounded-full" />
            </div>

            <div className="space-y-4">
              <p className="text-gray-600 text-lg">This certificate is proudly presented to</p>
              <h2 className="text-5xl font-bold text-gray-800">{userName}</h2>
            </div>

            <div className="space-y-2">
              <p className="text-gray-600 text-lg">for successfully earning the</p>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-teal-200">
                <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">
                  {badgeName}
                </h3>
                <p className="text-gray-600 mt-2">{badgeDescription}</p>
              </div>
            </div>

            <div className="pt-6 space-y-2">
              <p className="text-gray-500 text-sm">
                Awarded on {new Date(earnedDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <div className="flex items-center justify-center space-x-2">
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-teal-500 to-transparent" />
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">
                  SP.End
                </p>
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-teal-500 to-transparent" />
              </div>
              <p className="text-gray-500 text-xs italic">
                Spend smart, save more
              </p>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Close
          </button>
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition"
          >
            <Share2 className="w-5 h-5" />
            <span>Share</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl font-medium hover:from-teal-600 hover:to-blue-700 transition"
          >
            <Download className="w-5 h-5" />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
}
