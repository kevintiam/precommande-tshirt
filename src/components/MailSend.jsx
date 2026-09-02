import { Html, Heading, Text, Container } from '@react-email/components';



export default function OrderReceipt({ customerName, orderId }) {
  return (
    <Html>
      <Container style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <Heading>Merci pour ta commande, {customerName} !</Heading>
        <Text>Ta commande de t-shirts <strong>#{orderId}</strong> a bien été confirmée.</Text>
        <Text>Nous préparons ton colis avec soin. Tu recevras un autre e-mail lors de l&apos;expédition.</Text>
      </Container>
    </Html>
  );
}