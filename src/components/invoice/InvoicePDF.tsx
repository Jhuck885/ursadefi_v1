import { Document, Page, Text, View, StyleSheet, Image, Link } from '@react-pdf/renderer';
import { pdf } from '@react-pdf/renderer';

// Dark X.com-inspired styles (your exact + unbreakable payment box)
const styles = StyleSheet.create({
  page: {
    backgroundColor: '#1c1e24ff',
    color: '#e2e8f0',
    padding: 50,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#ffffff',
    marginBottom: 10,
  },
  subheader: {
    fontSize: 12,
    textAlign: 'center',
    color: '#94a3b8',
    marginBottom: 30,
  },
  logoTop: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  label: {
    width: 120,
    color: '#94a3b8',
    fontWeight: 'bold',
  },
  value: {
    flex: 1,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  descriptionHeading: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1D9BF0',
    marginBottom: 10,
  },
  descriptionText: {
    color: '#e2e8f0',
    lineHeight: 1.5,
    marginBottom: 30,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    fontSize: 11,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1D9BF0',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 5,
    marginBottom: 5,
  },
  totalLabel: {
    color: '#1D9BF0',
  },
  totalAmount: {
    color: '#ffffff',
  },
  paymentSection: {
    marginTop: 5,
    padding: 8, // reduced
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#1D9BF0',
    borderRadius: 8,
    alignItems: 'center',
    pageBreakInside: 'avoid', // unbreakable
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1D9BF0',
    marginBottom: 5,
  },
  qrImage: {
    width: 65, // reduced + scannable
    height: 65,
    marginBottom: 8,
  },
  paymentDetails: {
    width: '70%',
    alignItems: 'center',
    breakInside: 'avoid',
  },
  detailText: {
    fontSize: 10,
    color: '#e2e8f0',
    textAlign: 'center',
    marginBottom: 8,
  },
  boldBlue: {
    color: '#1D9BF0',
    fontWeight: 'bold',
  },
  note: {
    marginTop: 8,
    fontSize: 10,
    color: '#94a3b8',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  metadataSection: {
    marginTop: 90,
    padding: 8,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    pageBreakInside: 'avoid',
  },
  metadataTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1D9BF0',
    marginBottom: 10,
  },
  hashRow: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  hashLabel: {
    marginRight: 8,
    color: '#e2e8f0',
  },
  hashText: {
    fontFamily: 'Courier',
    fontSize: 10,
    color: '#1D9BF0',
  },
  explorerLink: {
    marginTop: 10,
    color: '#1D9BF0',
  },
  recurringSection: {
    marginBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#1D9BF0',
    paddingTop: 10,
  },
  recurringTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1D9BF0',
    marginBottom: 10,
  },
  recurringText: {
    color: '#e2e8f0',
    lineHeight: 1.5,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 20,
    left: 50,
    right: 50,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 10,
  },
  logoFooter: {
    width: 30,
    height: 30,
  },
});

type InvoicePDFProps = {
  id: string;
  clientName: string;
  dueDate: string;
  description: string;
  amount_xrp: string | number;
  destination_tag: number;
  receivingAddress: string;
  qrDataUrl: string;
  metadataTxHash?: string;
  issuedDate?: string;
  isRecurring?: boolean; // Added
  recurringInterval?: string; // Added
};

export const generateInvoicePDF = async (invoice: InvoicePDFProps) => {
  const invoiceNumber = `INV-${String(invoice.id).padStart(9, '0')}`;
  const issued = invoice.issuedDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const xrpAmount = Number(invoice.amount_xrp) || 0;
  const xrpPriceUSD = 2.30; // January 6, 2026 average for footer notes wrt "Powered by GeckLabs" I need to get api calls from geckolabs...IMPORTANT!
  const usdEquivalent = (xrpAmount * xrpPriceUSD).toFixed(2);
  const explorerUrl = invoice.metadataTxHash ? `https://testnet.xrpl.org/transactions/${invoice.metadataTxHash}` : null;

  const blob = await pdf(
    <Document>
      <Page size="A4" style={styles.page}>
        <Image style={styles.logoTop} src="1_ursadefi_logo.png" />
        <Text style={styles.header}>UrsaDeFi Invoice</Text>
        <Text style={styles.subheader}>{invoiceNumber}</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Client:</Text>
            <Text style={styles.value}>{invoice.clientName || 'Valued Client'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Issued:</Text>
            <Text style={styles.value}>{issued}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Payment Due Date:</Text>
            <Text style={styles.value}>{invoice.dueDate || 'Upon Receipt'}</Text>
          </View>
        </View>
        <Text style={styles.descriptionHeading}>Description of Services</Text>
        <Text style={styles.descriptionText}>
          {invoice.description || 'Freelance services as agreed.'}
        </Text>
        <View style={styles.amountRow}>
          <Text>Amount Due:</Text>
          <Text>{xrpAmount.toFixed(2)} XRP</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>USD/XRP</Text>
          <Text style={styles.totalAmount}>
            ${usdEquivalent} USD ({xrpAmount.toFixed(2)} XRP)
          </Text>
        </View>
        {invoice.isRecurring && (
          <View style={styles.recurringSection}>
            <Text style={styles.recurringTitle}>Recurring Payment</Text>
            <Text style={styles.recurringText}>
              This is a recurring invoice. Interval: {invoice.recurringInterval || 'Not specified'}
            </Text>
          </View>
        )}
        <View style={styles.paymentSection}>
          <Text style={styles.paymentTitle}>Scan and Pay with XRP (Testnet)</Text>
          {invoice.qrDataUrl && <Image style={styles.qrImage} src={invoice.qrDataUrl} />}
          <View style={styles.paymentDetails}>
            <Text style={styles.detailText}>
              Send exactly <Text style={styles.boldBlue}>{xrpAmount.toFixed(2)} XRP</Text> to:
            </Text>
            <Text style={styles.boldBlue}>Address: {invoice.receivingAddress}</Text>
            <Text style={styles.boldBlue}>Destination Tag: {invoice.destination_tag}</Text>
          </View>
          <Text style={styles.note}>
            Scan with Ledger, ANY XRPL wallet • Real-time pricing of XRP powered by GeckoLabs
          </Text>
        </View>
        {invoice.metadataTxHash && (
          <View style={styles.metadataSection}>
            <Text style={styles.metadataTitle}>On-Chain Metadata (XRPL Testnet)</Text>
            <Text style={styles.detailText}>
              Invoice details permanently recorded
            </Text>
            <View style={styles.hashRow}>
              <Text style={styles.hashLabel}>Transaction Hash:</Text>
              <Link src={explorerUrl!}>
                <Text style={styles.hashText}>{invoice.metadataTxHash}</Text>
              </Link>
            </View>
            <Link src={explorerUrl!} style={styles.explorerLink}>
              <Text>View Transaction on Explorer</Text>
            </Link>
          </View>
        )}
        <View style={styles.footerContainer} fixed>
          <Text style={styles.footerText}>
            Invoice metadata recorded on XRPL • Crypto payments auto-detected • Tax-ready invoicing for freelancers
          </Text>
          <Image style={styles.logoFooter} src="/1_ursadefi_logo.png" />
        </View>
      </Page>
    </Document>
  ).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `UrsaDeFi-${invoiceNumber}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
};