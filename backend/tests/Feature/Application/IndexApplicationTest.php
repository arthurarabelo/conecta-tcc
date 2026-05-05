<?php

namespace Tests\Feature\Application;

use App\Models\Application;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IndexApplicationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return void
     */
    public function test_student_sees_only_own_applications(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $other = User::factory()->create(['role' => 'student']);
        $token = $student->createToken('api')->plainTextToken;

        Application::factory()->count(2)->create(['student_id' => $student->id]);
        Application::factory()->create(['student_id' => $other->id]);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/applications');

        $response->assertStatus(200);
        $this->assertCount(2, $response->json('data'));
    }

    /**
     * @return void
     */
    public function test_professor_sees_applications_for_own_proposals(): void
    {
        $professor = User::factory()->create(['role' => 'professor']);
        $otherProfessor = User::factory()->create(['role' => 'professor']);
        $token = $professor->createToken('api')->plainTextToken;

        $proposal = Proposal::factory()->create(['professor_id' => $professor->id]);
        $otherProposal = Proposal::factory()->create(['professor_id' => $otherProfessor->id]);

        Application::factory()->count(3)->create(['proposal_id' => $proposal->id]);
        Application::factory()->create(['proposal_id' => $otherProposal->id]);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/applications');

        $response->assertStatus(200);
        $this->assertCount(3, $response->json('data'));
    }

    /**
     * @return void
     */
    public function test_can_filter_by_status(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $token = $student->createToken('api')->plainTextToken;
        $proposal = Proposal::factory()->create(['max_slots' => 10]);

        Application::factory()->create(['student_id' => $student->id, 'proposal_id' => $proposal->id, 'status' => 'pending']);
        Application::factory()->create([
            'student_id' => User::factory()->create(['role' => 'student'])->id,
            'proposal_id' => Proposal::factory()->create()->id,
            'status' => 'approved',
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/applications?status=pending');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }

    /**
     * @return void
     */
    public function test_unauthenticated_user_cannot_list_applications(): void
    {
        $this->getJson('/api/applications')->assertStatus(401);
    }
}
