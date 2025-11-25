'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui';

interface TooltipStep {
  target: string; // CSS selector for the element to highlight
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const BASE_STEPS: TooltipStep[] = [
  {
    target: '[data-onboarding="checkin"]',
    title: 'Daily Check-in',
    description: 'Tap here each day to let your family know you\'re doing okay. Build your streak!',
    position: 'bottom',
  },
  {
    target: '[data-onboarding="streak"]',
    title: 'Your Streak',
    description: 'See how many days in a row you\'ve checked in. Keep it going!',
    position: 'bottom',
  },
  {
    target: '[data-onboarding="medications"]',
    title: 'Your Medications',
    description: 'View and manage all your medications here. Tap "View" to see details.',
    position: 'top',
  },
  {
    target: '[data-onboarding="activity"]',
    title: 'Activity History',
    description: 'See your past check-ins and medication logs organized by day.',
    position: 'top',
  },
  {
    target: '[data-onboarding="appointments"]',
    title: 'Appointments',
    description: 'Coming soon! You\'ll be able to track doctor visits and lab work here.',
    position: 'top',
  },
];

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [highlightRect, setHighlightRect] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(false);

  // Detect viewport on mount
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Build steps with responsive nav step at the end
  const steps = useMemo<TooltipStep[]>(() => [
    ...BASE_STEPS,
    {
      target: isMobile ? '[data-onboarding="bottom-nav"]' : '[data-onboarding="top-nav"]',
      title: 'Navigation',
      description: 'Use these to quickly jump between Home, Medications, Check-in, Activity, and Profile.',
      position: isMobile ? 'top' : 'bottom',
    },
  ], [isMobile]);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const updatePositions = useCallback(() => {
    const target = document.querySelector(step.target);
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const padding = 8;

    setHighlightRect({
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    });

    // Position tooltip based on step.position
    const tooltipWidth = 280;
    const tooltipHeight = 140;
    let top = 0;
    let left = 0;

    switch (step.position) {
      case 'bottom':
        top = rect.bottom + 16;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'top':
        top = rect.top - tooltipHeight - 16;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - 16;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + 16;
        break;
    }

    // Keep tooltip within viewport
    left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));
    top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16));

    setTooltipPosition({ top, left });
  }, [step]);

  useEffect(() => {
    updatePositions();
    window.addEventListener('resize', updatePositions);
    window.addEventListener('scroll', updatePositions);
    return () => {
      window.removeEventListener('resize', updatePositions);
      window.removeEventListener('scroll', updatePositions);
    };
  }, [updatePositions]);

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Overlay with cutout */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect
              x={highlightRect.left}
              y={highlightRect.top}
              width={highlightRect.width}
              height={highlightRect.height}
              rx="12"
              fill="black"
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.6)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Highlight border */}
      <div
        className="absolute border-2 border-[#4a9d94] rounded-xl pointer-events-none transition-all duration-300"
        style={{
          top: highlightRect.top,
          left: highlightRect.left,
          width: highlightRect.width,
          height: highlightRect.height,
        }}
      />

      {/* Tooltip */}
      <div
        className="absolute bg-white rounded-xl shadow-2xl p-4 w-[280px] transition-all duration-300"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        {/* Progress indicator */}
        <div className="flex gap-1 mb-3">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full ${
                index <= currentStep ? 'bg-[#4a9d94]' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <h3 className="font-semibold text-gray-900 text-lg mb-1">{step.title}</h3>
        <p className="text-gray-600 text-sm mb-4">{step.description}</p>

        <div className="flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Skip tour
          </button>
          <Button size="sm" onClick={handleNext}>
            {isLastStep ? 'Get Started' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}
