import React, { useState, useEffect } from 'react';
import { NavRoute, Language, NavigationPayload } from './types';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { StandardsExplorerPage } from './pages/StandardsExplorerPage';
import { ProductToStandardPage } from './pages/ProductToStandardPage';
import { CertificationPage } from './pages/CertificationPage';
import { QcoRegulationsPage } from './pages/QcoRegulationsPage';
import { TestingLaboratoriesPage } from './pages/TestingLaboratoriesPage';
import { HallmarkingJewelleryPage } from './pages/HallmarkingJewelleryPage';
import { LicensedJewellerPage } from './pages/LicensedJewellerPage';
import { VerificationSuitePage } from './pages/VerificationSuitePage';
import { DocumentImageAnalysisPage } from './pages/DocumentImageAnalysisPage';
import { ComplianceGapAnalysisPage } from './pages/ComplianceGapAnalysisPage';
import { WhistleblowerPage } from './pages/WhistleblowerPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export const App: React.FC = () => {
  // Map current path from browser URL to NavRoute
  const getRouteFromPath = (path: string): NavRoute => {
    const clean = path.replace(/\/$/, '') || '/';
    if (clean === '/' || clean === '/dashboard') return '/';
    if (clean === '/login' || clean === 'login') return '/login';
    if (clean === '/chat' || clean === '/ai-assistant') return '/chat';
    if (clean.startsWith('/standards')) return clean as NavRoute;
    if (clean === '/product-to-standard') return '/product-to-standard';
    if (clean.startsWith('/certification')) return clean as NavRoute;
    if (clean === '/qco-regulations') return '/qco-regulations';
    if (clean === '/laboratories' || clean === '/testing-laboratories') return '/laboratories';
    if (clean === '/licensed-jewellers') return '/licensed-jewellers';
    if (clean.startsWith('/verify') || clean === '/verification-suite') return clean as NavRoute;
    if (clean.startsWith('/hallmarking')) return clean as NavRoute;
    if (
      clean === '/document-image-lab' ||
      clean === '/documents-analysis' ||
      clean === '/document-analysis' ||
      clean === '/image-analysis' ||
      clean === '/label-scanner' ||
      clean === '/assay-explainer'
    ) {
      return clean as NavRoute;
    }
    if (clean === '/compliance-gap') return '/compliance-gap';
    if (clean === '/whistleblower') return '/whistleblower';
    if (clean.startsWith('/admin')) return clean as NavRoute;
    return '/';
  };

  const getPathFromRoute = (route: NavRoute): string => {
    switch (route) {
      case 'dashboard':
      case '/':
        return '/';
      case 'login':
      case '/login':
        return '/login';
      case 'ai-assistant':
      case 'chat':
      case '/chat':
        return '/chat';
      case 'standards-explorer':
      case 'standards':
      case '/standards':
        return '/standards';
      case '/standards/search':
        return '/standards/search';
      case '/standards/:id':
      case '/standards/:id/clauses':
        return '/standards';
      case 'product-to-standard':
      case '/product-to-standard':
        return '/product-to-standard';
      case 'certification':
      case '/certification':
        return '/certification';
      case '/certification/schemes':
        return '/certification/schemes';
      case '/certification/mapping':
        return '/certification/mapping';
      case '/certification/roadmap':
        return '/certification/roadmap';
      case '/certification/checklist':
        return '/certification/checklist';
      case 'qco-regulations':
      case '/qco-regulations':
        return '/qco-regulations';
      case 'testing-laboratories':
      case 'laboratories':
      case '/laboratories':
        return '/laboratories';
      case 'licensed-jewellers':
      case '/licensed-jewellers':
        return '/licensed-jewellers';
      case 'verify':
      case '/verify':
      case 'verification-suite':
      case '/verification-suite':
        return '/verify';
      case '/verify/huid':
        return '/verify/huid';
      case '/verify/licence':
        return '/verify/licence';
      case '/verify/crs':
        return '/verify/crs';
      case 'hallmarking-jewellery':
      case 'hallmarking':
      case '/hallmarking':
        return '/hallmarking';
      case '/hallmarking/centres':
        return '/hallmarking/centres';
      case '/hallmarking/scanner':
        return '/hallmarking/scanner';
      case '/hallmarking/purity':
        return '/hallmarking/purity';
      case '/hallmarking/assay':
        return '/hallmarking/assay';
      case '/hallmarking/huid':
        return '/verify/huid';
      case 'documents-analysis':
      case 'document-image-lab':
      case '/document-image-lab':
        return '/document-image-lab';
      case '/document-analysis':
        return '/document-analysis';
      case '/image-analysis':
        return '/image-analysis';
      case '/label-scanner':
        return '/label-scanner';
      case '/assay-explainer':
        return '/assay-explainer';
      case 'compliance-gap':
      case '/compliance-gap':
        return '/compliance-gap';
      case 'whistleblower':
      case '/whistleblower':
        return '/whistleblower';
      case 'admin-dashboard':
      case 'admin':
      case '/admin':
        return '/admin';
      case '/admin/health':
        return '/admin/health';
      case '/admin/sync':
        return '/admin/sync';
      case '/admin/gap-report':
        return '/admin/gap-report';
      case '/admin/review':
        return '/admin/review';
      default: {
        const str = String(route);
        return str.startsWith('/') ? str : `/${str}`;
      }
    }
  };

  const [currentRoute, setCurrentRoute] = useState<NavRoute>(() => {
    return getRouteFromPath(window.location.pathname);
  });
  const [routePayload, setRoutePayload] = useState<NavigationPayload>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync with browser Back/Forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const route = getRouteFromPath(window.location.pathname);
      setCurrentRoute(route);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update dynamic document title per Section 11
  useEffect(() => {
    const routeStr = String(currentRoute);
    if (routeStr.startsWith('/standards') || routeStr === 'standards' || routeStr === 'standards-explorer') {
      document.title = 'BIS Parakh — Standards Explorer';
    } else if (routeStr.startsWith('/qco') || routeStr === 'qco-regulations') {
      document.title = 'BIS Parakh — QCO Explorer';
    } else if (routeStr.startsWith('/certification') || routeStr === 'certification') {
      document.title = 'BIS Parakh — Certification';
    } else if (routeStr.startsWith('/verify') || routeStr === 'verification-suite' || routeStr === 'verify') {
      document.title = 'BIS Parakh — Verification';
    } else if (routeStr.startsWith('/hallmarking') || routeStr === 'hallmarking') {
      document.title = 'BIS Parakh — Hallmarking';
    } else if (routeStr.startsWith('/laboratories') || routeStr === 'testing-laboratories') {
      document.title = 'BIS Parakh — Testing Laboratories';
    } else if (routeStr.startsWith('/licensed-jewellers')) {
      document.title = 'BIS Parakh — Licensed Jewellers';
    } else if (
      routeStr.startsWith('/document') ||
      routeStr.startsWith('/image') ||
      routeStr.startsWith('/label') ||
      routeStr.startsWith('/assay')
    ) {
      document.title = 'BIS Parakh — Document & Image Lab';
    } else if (routeStr.startsWith('/compliance-gap')) {
      document.title = 'BIS Parakh — Compliance Gap Analysis';
    } else if (routeStr.startsWith('/whistleblower')) {
      document.title = 'BIS Parakh — Whistleblower Grievance';
    } else if (routeStr.startsWith('/chat') || routeStr === 'ai-assistant') {
      document.title = 'BIS Parakh — AI Assistant';
    } else if (routeStr.startsWith('/admin')) {
      document.title = 'BIS Parakh — Admin Dashboard';
    } else {
      document.title = 'BIS Parakh — National Standards Portal';
    }
  }, [currentRoute]);

  const handleNavigate = (route: NavRoute, payload?: NavigationPayload) => {
    const targetPath = getPathFromRoute(route);
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
    setCurrentRoute(route);
    setRoutePayload(payload || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isHome = currentRoute === '/' || currentRoute === 'dashboard';

  const renderActivePage = () => {
    const routeStr = String(currentRoute);

    // AI Assistant
    if (routeStr === 'chat' || routeStr === '/chat' || routeStr === 'ai-assistant' || routeStr === '/ai-assistant') {
      return (
        <AIAssistantPage
          initialPrompt={typeof routePayload === 'string' ? routePayload : undefined}
          onNavigate={handleNavigate}
        />
      );
    }

    // Standards Explorer
    if (
      routeStr === 'standards' ||
      routeStr === '/standards' ||
      routeStr === 'standards-explorer' ||
      routeStr.startsWith('/standards')
    ) {
      return (
        <StandardsExplorerPage
          initialSearch={typeof routePayload === 'string' ? routePayload : ''}
          subRoute={
            routeStr === '/standards/:id/clauses'
              ? 'clauses'
              : routeStr === '/standards/:id'
              ? 'detail'
              : 'search'
          }
          onNavigate={handleNavigate}
        />
      );
    }

    // Product to Standard
    if (routeStr === 'product-to-standard' || routeStr === '/product-to-standard') {
      return <ProductToStandardPage onNavigate={handleNavigate} />;
    }

    // Certification (Schemes & Mapping)
    if (routeStr.startsWith('/certification') || routeStr === 'certification') {
      let initialTab: 'schemes' | 'mapping' | 'roadmap' | 'checklist' = 'schemes';
      if (routeStr === '/certification/mapping') initialTab = 'mapping';
      if (routeStr === '/certification/roadmap') initialTab = 'roadmap';
      if (routeStr === '/certification/checklist') initialTab = 'checklist';
      return (
        <CertificationPage
          initialStandardId={typeof routePayload === 'string' ? routePayload : undefined}
          initialTab={initialTab}
          onNavigate={handleNavigate}
        />
      );
    }

    // QCO Regulations
    if (routeStr === 'qco-regulations' || routeStr === '/qco-regulations') {
      return <QcoRegulationsPage onNavigate={handleNavigate} />;
    }

    // Testing Laboratories
    if (
      routeStr === 'testing-laboratories' ||
      routeStr === 'laboratories' ||
      routeStr === '/laboratories' ||
      routeStr === '/testing-laboratories'
    ) {
      return (
        <TestingLaboratoriesPage
          initialFilter={routePayload && typeof routePayload === 'object' && 'standard' in routePayload && typeof routePayload.standard === 'string' ? { standard: routePayload.standard } : undefined}
          onNavigate={handleNavigate}
        />
      );
    }

    // Licensed Jewellers
    if (routeStr === 'licensed-jewellers' || routeStr === '/licensed-jewellers') {
      return <LicensedJewellerPage onNavigate={handleNavigate} />;
    }

    // Unified Verification Hub
    if (
      routeStr === 'verify' ||
      routeStr === '/verify' ||
      routeStr === 'verification-suite' ||
      routeStr === '/verification-suite' ||
      routeStr.startsWith('/verify')
    ) {
      let initialTab: 'huid' | 'licence' | 'crs' = 'huid';
      if (routeStr === '/verify/licence') initialTab = 'licence';
      if (routeStr === '/verify/crs') initialTab = 'crs';
      return <VerificationSuitePage initialTab={initialTab} onNavigate={handleNavigate} />;
    }

    // Hallmarking
    if (routeStr.startsWith('/hallmarking') || routeStr === 'hallmarking' || routeStr === 'hallmarking-jewellery') {
      let initialSubFeature: 'centres' | 'scanner' | 'purity' = 'centres';
      if (routeStr === '/hallmarking/scanner') initialSubFeature = 'scanner';
      if (routeStr === '/hallmarking/purity') initialSubFeature = 'purity';
      return <HallmarkingJewelleryPage initialSubFeature={initialSubFeature} onNavigate={handleNavigate} />;
    }

    // Document & Image Lab (Assay Report Explainer)
    if (
      routeStr === 'documents-analysis' ||
      routeStr === 'document-image-lab' ||
      routeStr === '/document-image-lab' ||
      routeStr === '/document-analysis' ||
      routeStr === '/image-analysis' ||
      routeStr === '/label-scanner' ||
      routeStr === '/assay-explainer'
    ) {
      return <DocumentImageAnalysisPage initialTab="assay" onNavigate={handleNavigate} />;
    }

    // Compliance Gap Analysis
    if (routeStr === 'compliance-gap' || routeStr === '/compliance-gap') {
      return <ComplianceGapAnalysisPage onNavigate={handleNavigate} />;
    }

    // Whistleblower Grievance Portal
    if (routeStr === 'whistleblower' || routeStr === '/whistleblower') {
      return <WhistleblowerPage onNavigate={handleNavigate} />;
    }

    // Admin Dashboard
    if (routeStr.startsWith('/admin') || routeStr === 'admin' || routeStr === 'admin-dashboard') {
      let initialTab: 'OVERVIEW' | 'HEALTH' | 'SYNC' | 'ERRORS' | 'GAP_REPORT' | 'REVIEW' = 'OVERVIEW';
      if (routeStr === '/admin/health') initialTab = 'HEALTH';
      if (routeStr === '/admin/sync') initialTab = 'SYNC';
      if (routeStr === '/admin/gap-report') initialTab = 'GAP_REPORT';
      if (routeStr === '/admin/review') initialTab = 'REVIEW';
      return <AdminDashboardPage initialTab={initialTab} onNavigate={handleNavigate} />;
    }

    // Default to Home Dashboard
    return <DashboardPage onNavigate={handleNavigate} />;
  };

  return (
    <div className="app-layout">
      {/* Slide-out Navigation Drawer for Section Jump */}
      <Sidebar
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Full-Width Portal Wrapper */}
      <div className="main-wrapper">
        <Header
          currentRoute={currentRoute}
          onNavigate={handleNavigate}
          language={language}
          onLanguageChange={setLanguage}
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Dynamic Page Container */}
        <main
          className="page-container"
          style={{
            padding: isHome ? '16px 28px 40px' : '20px 28px 40px',
          }}
        >
          {renderActivePage()}
        </main>

        {/* Official Institutional Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default App;
