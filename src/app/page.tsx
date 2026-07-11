import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black font-sans relative overflow-x-hidden">
      {/* ── Gradient Hero Section — extends to fit Page 1 & Page 2 content ── */}
      <section
        className="relative w-full"
        style={{
          background: 'linear-gradient(180deg, #0012A3 0%, #004DFF 22%, #3895FF 60%, #8CD5FF 80%, #DAEEFF 92%, #ffffff 100%)',
          boxShadow: 'inset 0 0 120px rgba(255, 255, 255, 0.85), inset 0 0 40px rgba(255, 255, 255, 0.5)',
        }}
      >
        {/* ── Page 1: Hero Viewport (100vh) ── */}
        <div className="relative w-full min-h-screen flex flex-col justify-between">
          {/* Navbar — pinned to top */}
          <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 flex-shrink-0 relative z-20">
            <Navbar />
          </div>

          {/* ── Hero Content — centered in the viewport ── */}
          <div
            className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 relative z-10"
            style={{ paddingBottom: '80px' }}
          >

          {/* Eyebrow: white logo + product name */}
          <div className="flex items-center justify-center gap-[6px] mb-1.5">
            <Image
              src="/images/white.png"
              alt="Agent SPM"
              width={18}
              height={18}
              className="object-contain flex-shrink-0"
              // style={{ width: 'clamp(14px, 1.2vw, 18px)', height: 'clamp(14px, 1.2vw, 18px)' }}
            />
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                fontSize: '24px',
                letterSpacing: '0.01em',
                color: '#ffffff',
                whiteSpace: 'nowrap',
              }}
            >
              Agent Skills Package Manager
            </span>
          </div>

          {/* ── Main Headline ── */}
          {/* Spec: Instrument Serif, 400, italic, 128px → clamp-scaled for viewport */}
          <h1
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontWeight: 400,
              fontStyle: 'italic',
              fontSize: 'clamp(48px, 7.5vw, 108px)',
              lineHeight: '96%',
              letterSpacing: '-0.03em',
              textAlign: 'center',
              color: '#ffffff',
              maxWidth: 'clamp(480px, 70vw, 960px)',
              margin: '0 auto',
            }}
          >
            Intelligence should be Simple.
          </h1>

          {/* ── Body Copy — Inter Bold, white, centered ── */}
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: '18px',
              lineHeight: '1.35',
              letterSpacing: '-0.03em',
              textAlign: 'center',
              color: '#ffffff',
              maxWidth: '820px',
              marginTop: 'clamp(20px, 2.5vw, 36px)',
              opacity: 0.95,
            }}
          >
            Stop rebuilding. Start compounding. Skills arm your agents with battle–tested
            <br className="hidden md:inline" />
            procedural knowledge, installed in seconds, shared across teams, refined
            <br className="hidden md:inline" />
            over time. We&apos;re building the arsenal. You bring the mission.
          </p>

          {/* ── CTA Button ── */}
          <a
            href="#"
            className="download-cli-btn"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              className="mr-1.5 flex-shrink-0"
              style={{ width: '18px', height: '18px' }}
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 1.25C12.4142 1.25 12.75 1.58579 12.75 2V12.9726L14.4306 11.0119C14.7001 10.6974 15.1736 10.661 15.4881 10.9306C15.8026 11.2001 15.839 11.6736 15.5694 11.9881L12.5694 15.4881C12.427 15.6543 12.2189 15.75 12 15.75C11.7811 15.75 11.573 15.6543 11.4306 15.4881L8.43056 11.9881C8.16099 11.6736 8.19741 11.2001 8.51191 10.9306C8.8264 10.661 9.29988 10.6974 9.56944 11.0119L11.25 12.9726V2C11.25 1.58579 11.5858 1.25 12 1.25ZM6.99583 8.25196C7.41003 8.24966 7.74768 8.58357 7.74999 8.99778C7.7523 9.41199 7.41838 9.74964 7.00418 9.75194C5.91068 9.75803 5.1356 9.78643 4.54735 9.89448C3.98054 9.99859 3.65246 10.1658 3.40901 10.4092C3.13225 10.686 2.9518 11.0746 2.85315 11.8083C2.75159 12.5637 2.75 13.5648 2.75 15.0002V16.0002C2.75 17.4356 2.75159 18.4367 2.85315 19.1921C2.9518 19.9259 3.13225 20.3144 3.40901 20.5912C3.68577 20.868 4.07435 21.0484 4.80812 21.1471C5.56347 21.2486 6.56458 21.2502 8 21.2502H16C17.4354 21.2502 18.4365 21.2486 19.1919 21.1471C19.9257 21.0484 20.3142 20.868 20.591 20.5912C20.8678 20.3144 21.0482 19.9259 21.1469 19.1921C21.2484 18.4367 21.25 17.4356 21.25 16.0002V15.0002C21.25 13.5648 21.2484 12.5637 21.1469 11.8083C21.0482 11.0746 20.8678 10.686 20.591 10.4092C20.3475 10.1658 20.0195 9.99859 19.4527 9.89448C18.8644 9.78643 18.0893 9.75803 16.9958 9.75194C16.5816 9.74964 16.2477 9.41199 16.25 8.99778C16.2523 8.58357 16.59 8.24966 17.0042 8.25196C18.0857 8.25799 18.9871 8.28387 19.7236 8.41916C20.4816 8.55839 21.1267 8.82364 21.6517 9.34857C22.2536 9.95048 22.5125 10.7084 22.6335 11.6085C22.75 12.4754 22.75 13.5778 22.75 14.9453V16.0551C22.75 17.4227 22.75 18.525 22.6335 19.392C22.5125 20.2921 22.2536 21.0499 21.6517 21.6519C21.0497 22.2538 20.2919 22.5127 19.3918 22.6337C18.5248 22.7503 17.4225 22.7502 16.0549 22.7502H7.94513C6.57754 22.7502 5.47522 22.7503 4.60825 22.6337C3.70814 22.5127 2.95027 22.2538 2.34835 21.6519C1.74643 21.0499 1.48754 20.2921 1.36652 19.392C1.24996 18.525 1.24998 17.4227 1.25 16.0551V14.9453C1.24998 13.5778 1.24996 12.4754 1.36652 11.6085C1.48754 10.7084 1.74643 9.95048 2.34835 9.34857C2.87328 8.82363 3.51835 8.55839 4.27635 8.41916C5.01291 8.28387 5.9143 8.25798 6.99583 8.25196Z"
                fill="currentColor"
              />
            </svg>
            <span>Download The Cli</span>
          </a>
        </div>

        {/* Pixel Art SVG — centered on the bottom edge of Page 1 (50% above fold, 50% below) */}
        <div
          className="absolute left-0 w-full z-0 pointer-events-none select-none"
          style={{
            bottom: 0,
            transform: 'translateY(70%)',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1920 504"
            fill="none"
            className="w-full h-auto block"
          >
            <path
              fill="#fff"
              d="M137.122 274.244H91.415v45.708H0v-45.708h45.708v-45.707h91.414v45.707ZM274.244 319.952h-45.707v-45.708h45.707v45.708ZM182.83 182.83h45.707v91.414H182.83v-45.707h-45.708V182.83H91.415v-45.708h91.415v45.708ZM319.952 274.244h-45.708v-45.707h45.708v45.707ZM274.244 182.83h-45.707v-45.708h45.707v45.708ZM319.952 137.122h-45.708V91.719h-45.707V46.012h45.707V0h45.708v137.122ZM457.515 228.831h45.708v-45.707h91.414v45.707H548.93v45.708h-91.415v-45.708ZM320.393 183.124H366.1v45.707h-45.707v-45.707Z"
            />
            <path
              fill="#fff"
              d="M411.808 320.246H366.1v-91.415h45.708v45.708h45.707v45.707h45.708v45.707h-91.415v-45.707ZM274.685 228.831h45.708v45.708h-45.708v-45.708ZM320.393 320.246H366.1v45.707h-45.707v-45.707ZM274.685 365.953h-45.708v45.403H366.1v45.707h-45.707v46.013h-45.708V365.953ZM503.37 137.27h-45.708V91.562h-91.415v45.708h45.708v45.707h91.415V137.27ZM640.492 91.562h-45.708v45.708h45.708V91.562Z"
            />
            <path
              fill="#fff"
              d="M549.077 228.684h45.707V137.27h-45.707v45.707H503.37v45.707h-45.708v45.708h91.415v-45.708ZM686.199 137.27h-45.707v45.707h45.707V137.27ZM640.492 228.684h-45.708v45.708h45.708v-45.708ZM686.199 274.392h-45.707v45.402h-45.708v45.708h45.708v46.012h45.707V274.392ZM686.493 46.736h-45.707V1.03h-91.415v45.707h45.707v45.708h91.415V46.736ZM823.615 1.029h-45.707v45.707h45.707V1.03Z"
            />
            <path
              fill="#fff"
              d="M732.2 138.151h45.708V46.736H732.2v45.708h-45.707v45.707h-45.707v45.707H732.2v-45.707ZM869.323 46.736h-45.708v45.708h45.708V46.736ZM823.615 138.151h-45.707v45.707h45.707v-45.707ZM869.323 183.858h-45.708v45.403h-45.707v45.708h45.707v46.012h45.708V183.858ZM1097.27 229.713v-45.708h45.71V92.591h-45.71v45.707h-45.71v91.415h45.71ZM1142.98 366.835v-45.707h-45.71v45.707h45.71Z"
            />
            <path
              fill="#fff"
              d="M1005.86 275.42v45.708h91.41V275.42h-45.71v-45.707h-45.7v-45.708h-45.71v91.415h45.71ZM1097.27 412.543v-45.708h-45.71v45.708h45.71Z"
            />
            <path
              fill="#fff"
              d="M1005.86 366.835v-45.707h-45.71v45.707h45.71ZM960.15 412.543v-45.708h-45.403v-45.707H869.04v45.707h-46.012v45.708H960.15ZM1097.42 275.273h45.71v45.708h91.41v-45.708h-45.71v-45.707h-91.41v45.707ZM960.297 320.981H1006v-45.708h-45.703v45.708ZM1051.71 183.858H1006v91.415h45.71v-45.707h45.71v-45.708h45.71v-45.707h-91.42v45.707ZM914.589 275.273h45.708v-45.707h-45.708v45.707ZM960.297 183.858H1006v-45.707h-45.703v45.707ZM914.589 138.151h45.708V92.748H1006V47.041h-45.703V1.029h-45.708V138.15ZM1188.54 46.736h-45.71V1.03h-91.41v45.707h45.71v45.708h91.41V46.736ZM1325.66 1.029h-45.71v45.707h45.71V1.03Z"
            />
            <path
              fill="#fff"
              d="M1234.25 138.151h45.7V46.736h-45.7v45.708h-45.71v45.707h-45.71v45.707h91.42v-45.707ZM1371.37 46.736h-45.71v45.708h45.71V46.736ZM1325.66 138.151h-45.71v45.707h45.71v-45.707ZM1371.37 183.858h-45.71v45.403h-45.71v45.708h45.71v46.012h45.71V183.858Z"
            />
            <path
              fill="#fff"
              d="M1462.2 228.831h-45.71v-45.707h-91.42v45.707h45.71v45.708h91.42v-45.708ZM1599.32 183.124h-45.71v45.707h45.71v-45.707Z"
            />
            <path
              fill="#fff"
              d="M1507.9 320.246h45.71v-91.415h-45.71v45.708h-45.7v45.707h-45.71v45.707h91.41v-45.707ZM1645.03 228.831h-45.71v45.708h45.71v-45.708Z"
            />
            <path
              fill="#fff"
              d="M1599.32 320.246h-45.71v45.707h45.71v-45.707ZM1645.03 365.953h-45.71v45.403h-45.71v45.707h45.71v46.013h45.71V365.953ZM1782.59 274.244h45.71v45.708h91.41v-45.708H1874v-45.707h-91.41v45.707ZM1645.47 319.952h45.7v-45.708h-45.7v45.708Z"
            />
            <path
              fill="#fff"
              d="M1736.88 182.83h-45.71v91.414h45.71v-45.707h45.71V182.83h45.71v-45.708h-91.42v45.708ZM1599.76 274.244h45.71v-45.707h-45.71v45.707ZM1645.47 182.83h45.7v-45.708h-45.7v45.708ZM1599.76 137.122h45.71V91.719h45.7V46.012h-45.7V0h-45.71v137.122ZM1371.37 46.736v45.708h45.71V46.736h-45.71ZM1508.49 138.151V92.444h-91.41v45.707h45.7v45.707h45.71v45.708h45.71v-91.415h-45.71ZM1417.08 1.029v45.707h45.7V1.03h-45.7ZM1508.49 46.736v45.708h45.71V46.736h-45.71Z"
            />
          </svg>
        </div>
      </div>

      {/* ── Page 2: Scroll Spacer (allows user to scroll to reveal the rest of the SVG) ── */}
      <div className="h-[80vh] w-full relative z-10 pointer-events-none" />

    </section>
  </main>
);
}
