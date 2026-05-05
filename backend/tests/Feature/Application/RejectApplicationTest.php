<?php

namespace Tests\Feature\Application;

use App\Models\Application;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RejectApplicationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return void
     */
    public function test_professor_can_reject_application_with_feedback(): void
    {
        $professor = User::factory()->create(['role' => 'professor']);
        $token = $professor->createToken('api')->plainTextToken;
        $proposal = Proposal::factory()->create(['professor_id' => $professor->id]);
        $application = Application::factory()->create(['proposal_id' => $proposal->id]);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/applications/{$application->id}/reject", [
                'feedback' => 'Perfil não se encaixa.',
            ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['status' => 'rejected', 'feedback' => 'Perfil não se encaixa.']);

        $this->assertDatabaseHas('applications', [
            'id' => $application->id,
            'status' => 'rejected',
            'feedback' => 'Perfil não se encaixa.',
        ]);
    }

    /**
     * @return void
     */
    public function test_professor_can_reject_without_feedback(): void
    {
        $professor = User::factory()->create(['role' => 'professor']);
        $token = $professor->createToken('api')->plainTextToken;
        $proposal = Proposal::factory()->create(['professor_id' => $professor->id]);
        $application = Application::factory()->create(['proposal_id' => $proposal->id]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/applications/{$application->id}/reject")
            ->assertStatus(200)
            ->assertJsonFragment(['status' => 'rejected']);
    }

    /**
     * @return void
     */
    public function test_professor_cannot_reject_application_for_another_professors_proposal(): void
    {
        $professor = User::factory()->create(['role' => 'professor']);
        $other = User::factory()->create(['role' => 'professor']);
        $token = $other->createToken('api')->plainTextToken;
        $application = Application::factory()->create([
            'proposal_id' => Proposal::factory()->create(['professor_id' => $professor->id])->id,
        ]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/applications/{$application->id}/reject")
            ->assertStatus(403);
    }

    /**
     * @return void
     */
    public function test_unauthenticated_user_cannot_reject(): void
    {
        $application = Application::factory()->create();

        $this->patchJson("/api/applications/{$application->id}/reject")->assertStatus(401);
    }
}
